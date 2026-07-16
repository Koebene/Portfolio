/* ────────────────────────────────────────────────────────────────────────────
   The photos live in  js/photos.js  (the database you edit). This file is the
   logic that renders them — you normally don't need to touch it.
─────────────────────────────────────────────────────────────────────────── */

/* Photos come from js/photos.js. If the admin panel has saved a working copy
   in this browser (localStorage), use that instead so edits preview live. */
const PHOTO_OVERRIDE_KEY = "rvr_photos_override";
function loadCollections() {
  try {
    const raw = localStorage.getItem(PHOTO_OVERRIDE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.mono && data.color) return data;
    }
  } catch (e) { /* ignore and fall back to the file */ }
  return window.collections;
}

const collections = loadCollections();
let current = "mono";
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Fill in derived fields the rest of the code expects. */
function normalizeCollections() {
  Object.values(collections).forEach((col) => {
    col.photos.forEach((p) => {
      p.titleFlat = p.title.replace(/\n/g, " ");
      p._ar = getAR(p);
    });
  });
}

/* Aspect ratio (width / height): use the photo's `ar`, else 1. */
function getAR(p) {
  return p.ar && p.ar > 0 ? p.ar : 1;
}

/* Seeded RNG (mulberry32) — deterministic "randomness" so the arrangement
   looks varied but stays stable across resizes and reloads. */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Group items into rows of varying height — a justified gallery that leaves
   room around each photo. Taller target heights mean fewer, larger photos per
   row; `gap` is the breathing space between them (and is kept out of the maths
   so rows still line up edge to edge within the padded container). */
function buildRows(items, W, seed, gap) {
  const rand = mulberry32(seed);
  const isMobile = W < 720;
  const minH = isMobile ? 340 : 500;
  const maxH = isMobile ? 540 : 760;

  const rows = [];
  let row = [], arSum = 0;
  let target = minH + rand() * (maxH - minH);

  const rowHeight = (n, sum) => (W - gap * (n - 1)) / sum;

  items.forEach((it) => {
    row.push(it);
    arSum += it._ar;
    if (rowHeight(row.length, arSum) <= target) {
      rows.push({ items: row, h: rowHeight(row.length, arSum) });
      row = []; arSum = 0;
      target = minH + rand() * (maxH - minH);
    }
  });
  if (row.length) rows.push({ items: row, h: Math.min(rowHeight(row.length, arSum), maxH) });
  return rows;
}

const SEED = { mono: 7, color: 23 };

/* Reveal gallery photos as they scroll into view (clip + scale settle). */
const workIO = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); workIO.unobserve(e.target); }
  }),
  { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
);

/* ─── Render Works (justified layout) ───────────────────────────────────── */
function renderWorks(key) {
  const col = collections[key];
  const grid = document.querySelector(".works");
  grid.innerHTML = "";

  col.photos.forEach((p) => (p._ar = getAR(p)));

  // Inner content width (excluding the section's side padding) + the gap that
  // separates photos, both read from CSS so layout + styling stay in sync.
  const cs = getComputedStyle(grid);
  const padL = parseFloat(cs.paddingLeft) || 0;
  const padR = parseFloat(cs.paddingRight) || 0;
  const GAP = parseFloat(cs.rowGap) || 16;
  const W = (grid.clientWidth || window.innerWidth) - padL - padR;
  const rows = buildRows(col.photos, W, SEED[key], GAP);
  const total = String(col.photos.length).padStart(2, "0");

  rows.forEach((r) => {
    const rowEl = document.createElement("div");
    rowEl.className = "works-row";
    rowEl.style.height = r.h + "px";

    r.items.forEach((p, ci) => {
      const i = col.photos.indexOf(p);
      const item = document.createElement("div");
      item.className = "work-item";
      item.style.flexGrow = p._ar;          // width proportional to aspect ratio
      item.style.flexBasis = "0";
      item.style.transitionDelay = ci * 90 + "ms"; // stagger within the row
      // expose each photo as a real, keyboard-operable control
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
      item.setAttribute("aria-label", `${p.titleFlat} — ${p.cat}, ${p.date}. Open photograph.`);
      item.innerHTML = `
        <img src="${p.src}" alt="" loading="lazy" decoding="async">
        <img class="photo-mark" src="images/logo-watermark.svg" alt="" loading="lazy">
        <div class="work-overlay">
          <span class="work-num">${String(i + 1).padStart(2, "0")}</span>
          <div class="work-info">
            <div class="work-title">${p.title.replace("\n", "<br>")}</div>
            <div class="work-cat">${p.cat} — ${p.date}</div>
          </div>
        </div>
      `;
      const openThis = () => openOverlay(key, i);
      item.addEventListener("click", openThis);
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openThis(); }
      });
      rowEl.appendChild(item);
      if (REDUCED) item.classList.add("in");
      else workIO.observe(item);
    });

    grid.appendChild(rowEl);
  });

  document.querySelector(".works-count").textContent = `${total} Photos — ${col.name}`;
}

/* Re-layout on resize (debounced) so rows always stay edge-to-edge. */
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    renderWorks(current);
    const h = document.querySelector(".hero");
    heroThreshold = (h ? h.offsetHeight : window.innerHeight) - 70;
  }, 200);
});

/* ─── Switch Collection (+ theme) ───────────────────────────────────────────
   A full-screen wipe in the *target* theme slides up, the theme + grid swap
   underneath, then the wipe exits upward — a clean editorial scene change. */
let switching = false;
function switchCollection(key) {
  if (key === current || switching) return;
  current = key;

  document.querySelectorAll(".switch-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.key === key);
  });

  setThemeColor(key);

  if (REDUCED) {
    document.body.classList.toggle("mono", key === "mono");
    updateNav();
    renderWorks(key);
    return;
  }

  switching = true;
  const wipe = document.getElementById("wipe");
  wipe.querySelector(".wipe-name").textContent = collections[key].name;
  wipe.classList.toggle("light", key === "color");
  wipe.classList.add("in");

  setTimeout(() => {
    document.body.classList.toggle("mono", key === "mono");
    updateNav();
    renderWorks(key);
    wipe.classList.add("out");
    setTimeout(() => { wipe.classList.remove("in", "out"); switching = false; }, 700);
  }, 640);
}

/* ─── Film-roll reveal ───────────────────────────────────────────────────────
   The photo arrives as vertical "frames" advancing off a roll of film: each
   frame drops in with a stagger, separated by hairline frame-lines and a brief
   punch of contrast. Once the frames lock together they settle and we cross to a
   single seamless image underneath — so no frame-lines or sub-pixel seams remain.
─────────────────────────────────────────────────────────────────────────── */
function buildFilmReveal(container, src) {
  const N = 8; // number of film frames
  container.innerHTML = "";

  // The clean, seamless final image (hidden until the frames settle).
  const finalImg = document.createElement("img");
  finalImg.className = "film-final";
  finalImg.src = src;
  finalImg.alt = "";
  container.appendChild(finalImg);

  // Reduced motion: skip the whole film animation, just show the photo.
  if (REDUCED) { finalImg.classList.add("show"); return; }

  const reveal = document.createElement("div");
  reveal.className = "film-reveal";

  for (let i = 0; i < N; i++) {
    const strip = document.createElement("div");
    strip.className = "film-strip" + (i % 2 ? " down" : "");
    strip.style.left = (i * 100) / N + "%";
    strip.style.width = 100 / N + "%";
    strip.style.transitionDelay = i * 60 + "ms";

    const inner = document.createElement("div");
    inner.className = "film-inner";
    inner.style.width = N * 100 + "%";
    inner.style.left = -i * 100 + "%";
    inner.innerHTML = `<img src="${src}" alt="">`;

    strip.appendChild(inner);
    reveal.appendChild(strip);
  }
  reveal.insertAdjacentHTML("beforeend",
    '<div class="film-perf top"></div><div class="film-perf bottom"></div>');
  container.appendChild(reveal);

  requestAnimationFrame(() => requestAnimationFrame(() => reveal.classList.add("in")));

  const settleAt = 720 + N * 60 + 120;
  setTimeout(() => {
    reveal.classList.add("settled");   // fade frame-lines, perforations & contrast
    finalImg.classList.add("show");    // bring up the seamless image beneath
    setTimeout(() => reveal.remove(), 480); // drop the frames → zero seams left
  }, settleAt);
}

/* Light deterrent: block right-click "save image" and drag-saving on photos. */
document.addEventListener("contextmenu", (e) => {
  if (e.target.tagName === "IMG") e.preventDefault();
});
document.addEventListener("dragstart", (e) => {
  if (e.target.tagName === "IMG") e.preventDefault();
});

/* ─── Modal focus management (shared by overlay + book) ─────────────────────
   While a dialog is open, make the rest of the page `inert` so keyboard focus
   and screen readers stay inside it, and restore focus to the trigger on close. */
function pageChrome() {
  return [
    document.querySelector(".skip-link"),
    document.querySelector("nav"),
    document.getElementById("main"),
    document.querySelector("footer"),
  ];
}
function setChromeInert(on) {
  pageChrome().forEach((el) => { if (el) el.inert = on; });
}

/* ─── Project Overlay ───────────────────────────────────────────────────── */
const overlay = document.getElementById("overlay");
let overlayState = null;       // { key, idx } while the overlay is open
let overlayReturnFocus = null; // element to refocus when it closes

function openOverlay(key, idx) {
  const col = collections[key];
  const p = col.photos[idx];
  if (!p) return;

  const wasOpen = overlay.classList.contains("open");
  if (!wasOpen) overlayReturnFocus = document.activeElement;

  const total = col.photos.length;
  const nextIdx = (idx + 1) % total;
  const prevIdx = (idx - 1 + total) % total;
  const next = col.photos[nextIdx];
  const prev = col.photos[prevIdx];
  overlayState = { key, idx };

  overlay.innerHTML = `
    <nav class="overlay-nav">
      <span class="label">${col.name} / ${p.titleFlat}</span>
      <button class="overlay-close" onclick="closeOverlay()">Close ✕</button>
    </nav>
    <div class="overlay-hero">
      <div class="overlay-hero-image" id="overlay-hero-image"></div>
      <div class="overlay-hero-text">
        <div class="overlay-num"><em>${String(idx + 1).padStart(2, "0")}</em> / ${String(total).padStart(2, "0")}</div>
        <div class="overlay-title">${p.title.replace("\n", "<br>")}</div>
        <div class="overlay-divider"></div>
        <p class="overlay-desc">${p.desc}</p>
        <div class="overlay-fields">
          <div><div class="label">Category</div><div class="overlay-field-value">${p.cat}</div></div>
          <div><div class="label">Year</div><div class="overlay-field-value">${p.date}</div></div>
          <div><div class="label">Location</div><div class="overlay-field-value">${p.loc}</div></div>
        </div>
      </div>
    </div>
    <div class="overlay-footer">
      <button class="overlay-step" onclick="openOverlay('${key}', ${prevIdx})">← ${prev.titleFlat}</button>
      <span class="overlay-count"><em>${String(idx + 1).padStart(2, "0")}</em> / ${String(total).padStart(2, "0")}</span>
      <button class="overlay-step" onclick="openOverlay('${key}', ${nextIdx})">${next.titleFlat} →</button>
    </div>
  `;

  const heroImageEl = document.getElementById("overlay-hero-image");
  buildFilmReveal(heroImageEl, p.src);
  heroImageEl.insertAdjacentHTML("beforeend",
    '<img class="photo-mark" src="images/logo-watermark.svg" alt="">');
  overlay.scrollTop = 0;
  overlay.setAttribute("aria-hidden", "false");
  if (!wasOpen) setChromeInert(true);
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => {
    overlay.classList.add("open");
    overlay.querySelector(".overlay-close")?.focus();
  });
}

function closeOverlay() {
  if (!overlay.classList.contains("open")) return;
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
  overlayState = null;
  document.body.style.overflow = "";
  setChromeInert(false);
  if (overlayReturnFocus && overlayReturnFocus.focus) overlayReturnFocus.focus();
  overlayReturnFocus = null;
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeOverlay(); return; }
  // arrow keys step through photos while the overlay is open (book has its own)
  if (!overlayState || !overlay.classList.contains("open") || bookEl.classList.contains("open")) return;
  const total = collections[overlayState.key].photos.length;
  if (e.key === "ArrowRight") openOverlay(overlayState.key, (overlayState.idx + 1) % total);
  else if (e.key === "ArrowLeft") openOverlay(overlayState.key, (overlayState.idx - 1 + total) % total);
});

/* ─── Scroll reveal ─────────────────────────────────────────────────────── */
const observer = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); observer.unobserve(e.target); } }),
  { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
);
function observeReveal() { document.querySelectorAll(".reveal").forEach((el) => observer.observe(el)); }

/* ─── Nav ink: light over the dark hero / dark theme, dark over Chroma ─────
   Replaces a fixed mix-blend-mode (which flickered against moving content on
   scroll). State changes only on theme/section/menu changes — never per frame. */
const nav = document.querySelector("nav");
function updateNav() {
  if (!nav) return;
  const menuOpen = document.body.classList.contains("menu-open");
  const onHero = nav.classList.contains("over-hero") && !menuOpen;
  const lightInk = onHero || document.body.classList.contains("mono");
  nav.classList.toggle("ink-light", lightInk);
  nav.classList.toggle("ink-dark", !lightInk);
}

/* ─── Nav hide on scroll + reading progress + over-hero ink state ────────────
   over-hero is derived here (same scroll signal the hide/progress use) rather
   than via a separate observer, so the ink colour is always in step with the
   scroll position. The hero is ~100vh; once it clears the nav line the nav ink
   follows the section/theme instead. */
let lastY = 0;
let navOnHero = true;
const progressEl = document.getElementById("progress");
const heroEl = document.querySelector(".hero");
let heroThreshold = (heroEl ? heroEl.offsetHeight : window.innerHeight) - 70;
window.addEventListener("scroll", () => {
  const se = document.scrollingElement;
  const y = se.scrollTop;
  nav.style.transform = y > lastY && y > 100 ? "translateY(-110%)" : "";
  lastY = y;
  if (progressEl) {
    const max = se.scrollHeight - window.innerHeight;
    progressEl.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  }
  const onHero = y < heroThreshold;
  if (onHero !== navOnHero) {
    navOnHero = onHero;
    nav.classList.toggle("over-hero", onHero);
    updateNav();
  }
}, { passive: true });

/* ─── Smooth anchors ────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector(a.getAttribute("href"))?.scrollIntoView({ behavior: "smooth" });
  })
);

/* ─── Book Mode ─────────────────────────────────────────────────────────────
   A flip-through photo book. Builds a set of "spreads" (left page + right page)
   from the active collection: a cover, one spread per project (photo facing its
   title/description/date), and an end page. Real 3D page-turn on desktop, fade
   on mobile. Inherits the active theme automatically.
─────────────────────────────────────────────────────────────────────────── */
const bookEl       = document.getElementById("book");
const spreadEl     = document.getElementById("book-spread");
const bookPrevBtn  = document.getElementById("book-prev");
const bookNextBtn  = document.getElementById("book-next");

let bookSpreads = [];
let bookIndex   = 0;
let bookFlipping = false;

const photoPage = (src, pageNo) =>
  `<div class="page page-photo"><img src="${src}" alt="" loading="lazy">
   ${pageNo ? `<span class="book-pageno left">${pageNo}</span>` : ""}</div>`;

const coverPage = (col) => `
  <div class="page page-text page-cover">
    <span class="label">Ruben Van Ruysseveldt — Photographic Volume</span>
    <h2 class="book-cover-title">${col.name}</h2>
    <p class="book-cover-sub">${col.sub}</p>
    <span class="book-cover-year">2021 — 2025 / ${String(col.photos.length).padStart(2, "0")} Plates</span>
  </div>`;

const detailPage = (p, idx, total, pageNo) => `
  <div class="page page-text">
    <div class="book-num">Plate ${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div>
    <h3 class="book-title">${p.title.replace("\n", "<br>")}</h3>
    <div class="book-divider"></div>
    <p class="book-desc">${p.desc}</p>
    <div class="book-fields">
      <div><div class="label">Category</div><div class="book-field-value">${p.cat}</div></div>
      <div><div class="label">Year</div><div class="book-field-value">${p.date}</div></div>
      <div><div class="label">Location</div><div class="book-field-value">${p.loc}</div></div>
    </div>
    <span class="book-pageno right">${pageNo}</span>
  </div>`;

const endPage = () => `
  <div class="page page-text page-end">
    <h3 class="book-title">The<br>End</h3>
    <div class="book-divider"></div>
    <p class="book-desc">Thank you for looking. If any of this stayed with you, find me on Instagram.</p>
    <a class="contact-email" href="https://www.instagram.com/rubenvanruysseveldt/" target="_blank" rel="noopener">@rubenvanruysseveldt</a>
  </div>`;

function buildBook(key) {
  const col = collections[key];
  bookSpreads = [];

  // Cover: text left, feature photo right
  bookSpreads.push({ left: coverPage(col), right: photoPage(col.photos[0].src) });

  // One spread per photo: image left, details right
  col.photos.forEach((p, i) => {
    const leftNo  = (i + 1) * 2;
    const rightNo = leftNo + 1;
    bookSpreads.push({
      left:  photoPage(p.src, leftNo),
      right: detailPage(p, i, col.photos.length, rightNo),
    });
  });

  // End: closing photo left, colophon right
  const last = col.photos[col.photos.length - 1];
  bookSpreads.push({ left: photoPage(last.src), right: endPage() });

  bookIndex = 0;
}

function renderSpread(i) {
  const s = bookSpreads[i];
  spreadEl.innerHTML = s.left + s.right;
  updateBookUI();
}

function updateBookUI() {
  const total = bookSpreads.length;
  const label =
    bookIndex === 0 ? "Cover" :
    bookIndex === total - 1 ? "Colophon" :
    `Plate ${String(bookIndex).padStart(2, "0")}`;
  document.querySelector(".book-crumb").textContent = `${collections[current].name} — Photo Book`;
  document.querySelector(".book-counter").textContent = `${label} — Spread ${bookIndex + 1} / ${total}`;
  bookPrevBtn.disabled = bookIndex === 0;
  bookNextBtn.disabled = bookIndex === total - 1;
}

let bookReturnFocus = null;
function openBook() {
  bookReturnFocus = document.activeElement;
  buildBook(current);
  renderSpread(0);
  bookEl.setAttribute("aria-hidden", "false");
  setChromeInert(true);
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => {
    bookEl.classList.add("open");
    document.querySelector(".book-close")?.focus();
  });
}

function closeBook() {
  if (!bookEl.classList.contains("open")) return;
  bookEl.classList.remove("open");
  bookEl.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  setChromeInert(false);
  if (bookReturnFocus && bookReturnFocus.focus) bookReturnFocus.focus();
  bookReturnFocus = null;
}

function turnPage(dir) {
  if (bookFlipping) return;
  const target = bookIndex + dir;
  if (target < 0 || target >= bookSpreads.length) return;

  // Mobile / no-perspective: simple fade swap
  if (window.innerWidth <= 820) {
    spreadEl.style.opacity = "0";
    setTimeout(() => {
      bookIndex = target;
      renderSpread(bookIndex);
      requestAnimationFrame(() => (spreadEl.style.opacity = "1"));
    }, 200);
    return;
  }

  bookFlipping = true;
  const cur = bookSpreads[bookIndex];
  const nxt = bookSpreads[target];

  const flip = document.createElement("div");
  flip.className = "flip " + (dir > 0 ? "flip-next" : "flip-prev");

  if (dir > 0) {
    // Underneath: keep current left, reveal next right
    spreadEl.innerHTML = cur.left + nxt.right;
    flip.innerHTML =
      `<div class="flip-face flip-front">${cur.right}</div>` +
      `<div class="flip-face flip-back">${nxt.left}</div>`;
  } else {
    // Underneath: reveal prev left, keep current right
    spreadEl.innerHTML = nxt.left + cur.right;
    flip.innerHTML =
      `<div class="flip-face flip-front">${cur.left}</div>` +
      `<div class="flip-face flip-back">${nxt.right}</div>`;
  }

  document.querySelector(".book").appendChild(flip);
  void flip.offsetWidth; // force reflow
  flip.classList.add("flipping");

  flip.addEventListener("transitionend", function onEnd(e) {
    if (e.propertyName !== "transform") return;
    flip.removeEventListener("transitionend", onEnd);
    bookIndex = target;
    renderSpread(bookIndex);
    flip.remove();
    bookFlipping = false;
  });
}

const bookNext = () => turnPage(1);
const bookPrev = () => turnPage(-1);

/* ─── Custom gallery cursor ──────────────────────────────────────────────────
   A small circular "View" cue that follows the pointer and grows over gallery
   photos. Pointer devices only; touch devices skip it entirely. */
function initGalleryCursor() {
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

  const cursor = document.createElement("div");
  cursor.className = "cursor-view";
  cursor.textContent = "View";
  document.body.appendChild(cursor);
  document.body.classList.add("has-cursor");

  let raf = null, x = 0, y = 0;
  document.addEventListener("mousemove", (e) => {
    x = e.clientX; y = e.clientY;
    if (!raf) raf = requestAnimationFrame(() => {
      cursor.style.left = x + "px";
      cursor.style.top = y + "px";
      raf = null;
    });
  });

  const grid = document.querySelector(".works");
  grid.addEventListener("mouseover", (e) => {
    if (e.target.closest(".work-item")) cursor.classList.add("show");
  });
  grid.addEventListener("mouseout", (e) => {
    if (!e.relatedTarget || !e.relatedTarget.closest(".work-item")) cursor.classList.remove("show");
  });
  // never linger when an overlay/book opens
  document.addEventListener("click", () => cursor.classList.remove("show"));
}

/* ─── Hero motion: content drifts up & fades as you scroll past it ──────── */
function initHeroMotion() {
  if (REDUCED) return;
  const content = document.querySelector(".hero-content");
  const meta = document.querySelector(".hero-meta-top");
  const side = document.querySelector(".hero-side");
  const vh = () => window.innerHeight;
  let raf = null, lastF = -1;
  window.addEventListener("scroll", () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      const y = document.scrollingElement.scrollTop;
      // once the hero is fully scrolled past, stop writing styles (avoids
      // needless repaints of the masthead subtree on every deep-page scroll)
      if (y > vh()) { if (lastF !== 0) { lastF = 0; } return; }
      const f = Math.max(0, 1 - y / (vh() * 0.85));
      if (f === lastF) return;
      lastF = f;
      content.style.opacity = f;
      content.style.transform = `translateY(${y * -0.08}px)`;
      if (meta) meta.style.opacity = f;
      if (side) side.style.opacity = f;
    });
  }, { passive: true });
}


/* keep the mobile browser chrome in step with the active theme */
function setThemeColor(key) {
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", key === "mono" ? "#0B0B0C" : "#F3F1EA");
}

/* ─── Local time (Belgium) in the footer ────────────────────────────────── */
function initClock() {
  const el = document.getElementById("local-time");
  if (!el) return;
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Brussels", hour: "2-digit", minute: "2-digit" });
  const tick = () => { el.textContent = fmt.format(new Date()); };
  tick();
  setInterval(tick, 30000);
}

/* ─── Init ──────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  normalizeCollections();
  document.body.classList.add("mono"); // start in monochrome
  updateNav();                         // sync nav ink to the starting theme
  document.querySelectorAll(".switch-btn").forEach((btn) =>
    btn.addEventListener("click", () => switchCollection(btn.dataset.key))
  );
  renderWorks(current);
  observeReveal();
  initGalleryCursor();
  initHeroMotion();
  initClock();

  // keep the footer copyright year current
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // choreographed first paint: hero lines rise once the intro has slid away
  const introEl = document.getElementById("intro");
  const introSkipped = !introEl || introEl.classList.contains("skip");
  setTimeout(() => document.body.classList.add("loaded"), introSkipped ? 120 : 1500);

  // back to top
  document.getElementById("back-top")?.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" })
  );

  // Mobile menu toggle
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  const closeMenu = () => {
    document.body.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
    updateNav();
  };
  navToggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    updateNav();
  });
  navLinks.addEventListener("click", (e) => { if (e.target.closest("a")) closeMenu(); });

  // Book triggers
  document.getElementById("open-book").addEventListener("click", openBook);
  document.getElementById("nav-book").addEventListener("click", (e) => { e.preventDefault(); openBook(); });
  bookNextBtn.addEventListener("click", bookNext);
  bookPrevBtn.addEventListener("click", bookPrev);
  document.getElementById("book-zone-next").addEventListener("click", bookNext);
  document.getElementById("book-zone-prev").addEventListener("click", bookPrev);

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (!bookEl.classList.contains("open")) return;
    if (e.key === "ArrowRight") bookNext();
    else if (e.key === "ArrowLeft") bookPrev();
    else if (e.key === "Escape") closeBook();
  });
});
