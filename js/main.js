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

/* Titles are stored in capitals (photos.js / admin), but the editorial serif
   wants them set in title case: "SHOES IN\nTHE SKY" → "Shoes in the Sky". */
const SMALL_WORDS = new Set(["a", "an", "and", "at", "by", "for", "in", "of", "on", "or", "the", "to", "with"]);
function titleCase(s) {
  let first = true;
  return s.toLowerCase().replace(/[^\s\n]+/g, (w) => {
    const keepSmall = !first && SMALL_WORDS.has(w);
    first = false;
    return keepSmall ? w : w.charAt(0).toUpperCase() + w.slice(1);
  });
}

/* Fill in derived fields the rest of the code expects. */
function normalizeCollections() {
  Object.values(collections).forEach((col) => {
    col.photos.forEach((p) => {
      p.titleFlat = p.title.replace(/\n/g, " ");
      const nice = titleCase(p.title);
      p.titleNice = nice.replace(/\n/g, " ");          // one line (index, captions)
      p.titleHTML = nice.replace(/\n/g, "<br>");        // as authored (detail, book)
      p._ar = getAR(p);
    });
  });
}
const frameNo = (i) => "N° " + String(i + 1).padStart(2, "0");

/* Aspect ratio (width / height): use the photo's `ar`, else 1. */
function getAR(p) {
  return p.ar && p.ar > 0 ? p.ar : 1;
}

/* ─── Responsive images ──────────────────────────────────────────────────────
   tools/build-image-variants.py writes js/image-variants.js, listing the widths
   available for each photo. We hand those to the browser as a srcset so a phone
   downloads an 800px file instead of the 2560px master — same visible sharpness,
   a fraction of the data. A photo missing from the manifest (e.g. just added and
   the script not run yet) simply renders from its plain src.
   `sizes` describes how wide the photo will actually be shown. */
function imgSrcset(src) {
  const v = window.imageVariants && window.imageVariants[src];
  if (!v || v.length < 2) return "";
  return v.map(([w, path]) => `${path} ${w}w`).join(", ");
}

/* Build the srcset/sizes attribute pair for an <img> in HTML strings. */
function imgAttrs(src, sizes) {
  const set = imgSrcset(src);
  return set ? ` srcset="${set}" sizes="${sizes}"` : "";
}

const SIZES_GRID    = "(max-width: 820px) 100vw, 50vw";
const SIZES_OVERLAY = "(max-width: 820px) 100vw, 55vw";
const SIZES_BOOK    = "(max-width: 820px) 94vw, min(590px, 46vw)";

/* Seeded RNG (mulberry32) — deterministic "randomness" so the arrangement
   stays stable across resizes and collection switches within one visit. */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Fisher–Yates shuffle, in place. */
function shuffle(arr, rand) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* A fresh hang on every visit: each collection's photos are shuffled and the
   row-height rhythm is re-seeded once at load, then held for the rest of the
   session — so resizing or switching collections never reshuffles the wall
   under the visitor, but a reload always gives a different arrangement. */
function shuffleCollections() {
  Object.values(collections).forEach((col) => {
    shuffle(col.photos, Math.random);
  });
}

/* Group items into rows of varying height — a justified gallery that leaves
   room around each photo. Taller target heights mean fewer, larger photos per
   row; `gap` is the breathing space between them (and is kept out of the maths
   so rows still line up edge to edge within the padded container). */
function buildRows(items, W, seed, gap, single) {
  // Phones: one photo per row at full width, so every frame reads at a real
  // size instead of as a narrow two-up tile. Very tall frames are capped to
  // most of the screen height so one photo never needs more than a scroll.
  if (single) {
    const cap = window.innerHeight * 0.82;
    return items.map((it) => {
      const h = Math.min(W / it._ar, cap);
      return { items: [it], h, w: h * it._ar, single: true };
    });
  }

  const rand = mulberry32(seed);
  const minH = 500;
  const maxH = 760;

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

/* Same breakpoint as the CSS: at or below it the gallery is a single column. */
const SINGLE_COLUMN = window.matchMedia("(max-width: 820px)");

/* Re-seeded per page load (see shuffleCollections) so the row rhythm changes
   too — but read from here on every re-render, so resizes stay consistent. */
const SEED = {
  mono:  (Math.random() * 1e9) | 0,
  color: (Math.random() * 1e9) | 0,
};

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
  const single = SINGLE_COLUMN.matches;
  const rows = buildRows(col.photos, W, SEED[key], GAP, single);
  const total = String(col.photos.length).padStart(2, "0");

  rows.forEach((r) => {
    const rowEl = document.createElement("div");
    rowEl.className = "works-row" + (r.single ? " single" : "");
    if (!r.single) rowEl.style.height = r.h + "px";

    r.items.forEach((p, ci) => {
      const i = col.photos.indexOf(p);
      const item = document.createElement("div");
      item.className = "work-item";
      if (r.single) {
        item.style.flex = "none";
        item.style.width = r.w + "px";
        item.style.height = r.h + "px";
      } else {
        item.style.flexGrow = p._ar;          // width proportional to aspect ratio
        item.style.flexBasis = "0";
      }
      item.style.transitionDelay = ci * 90 + "ms"; // stagger within the row
      // expose each photo as a real, keyboard-operable control
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
      item.setAttribute("aria-label", `${p.titleFlat} — ${p.cat}, ${p.date}. Open photograph.`);
      item.innerHTML = `
        <img src="${p.src}"${imgAttrs(p.src, SIZES_GRID)} alt="" loading="lazy" decoding="async">
        <img class="photo-mark" src="images/logo-watermark.svg" alt="" loading="lazy">
        <div class="work-overlay" aria-hidden="true">
          <span class="work-num tech">${frameNo(i)}</span>
          <span class="work-title">${p.titleNice}</span>
          <span class="work-cat tech">${p.cat} — ${p.date}</span>
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

      // Phones get a quiet caption under the photo instead of text printed on
      // top of it (there is no hover to reveal it). The photo button already
      // carries the same information for screen readers.
      if (r.single) {
        const cap = document.createElement("div");
        cap.className = "work-caption tech";
        cap.setAttribute("aria-hidden", "true");
        cap.style.width = r.w + "px";
        cap.innerHTML = `
          <span class="work-caption-num">${frameNo(i)}</span>
          <span class="work-caption-title">${p.titleNice}</span>
          <span class="work-caption-meta">${p.cat} — ${p.date}</span>`;
        cap.addEventListener("click", openThis);
        rowEl.appendChild(cap);
      }
    });

    grid.appendChild(rowEl);
  });

  document.querySelector(".works-count").textContent = `${total} frames`;
  document.getElementById("work-sub").textContent = col.sub;
}

/* ─── Index view: the collection as a list of plates ─────────────────────────
   Number, title, category, place, year — one row per photograph. On a pointer
   device the photo floats next to the cursor while you read down the list;
   on phones each row carries a small thumbnail instead. */
let view = "gallery";
function renderIndex(key) {
  const col = collections[key];
  const list = document.querySelector(".index");
  list.innerHTML = col.photos.map((p, i) => {
    const thumb = (window.imageVariants && window.imageVariants[p.src]) ? window.imageVariants[p.src][0][1] : p.src;
    return `
    <li class="index-row" role="button" tabindex="0" data-i="${i}" data-thumb="${thumb}"
        aria-label="${p.titleFlat} — ${p.cat}, ${p.loc}, ${p.date}. Open photograph.">
      <img class="ix-thumb" src="${thumb}" alt="" loading="lazy" decoding="async">
      <span class="ix-num tech">${frameNo(i)}</span>
      <span class="ix-title">${p.titleNice}</span>
      <span class="ix-cat tech">${p.cat}</span>
      <span class="ix-loc tech">${p.loc}</span>
      <span class="ix-year tech">${p.date.replace(/^.*?(\d{4}).*$/, "$1")}</span>
    </li>`;
  }).join("");
}

function setView(next) {
  view = next;
  const gallery = document.querySelector(".works");
  const index = document.querySelector(".index");
  document.querySelectorAll(".view-btn[data-view]").forEach((b) => {
    const on = b.dataset.view === next;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  gallery.hidden = next !== "gallery";
  index.hidden = next !== "index";
  if (next === "index") renderIndex(current);
  else renderWorks(current);
}

function initIndex() {
  const list = document.querySelector(".index");
  const open = (row) => openOverlay(current, +row.dataset.i);
  list.addEventListener("click", (e) => { const row = e.target.closest(".index-row"); if (row) open(row); });
  list.addEventListener("keydown", (e) => {
    const row = e.target.closest(".index-row");
    if (row && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(row); }
  });

  // floating preview, eased toward the pointer so it trails like a loupe
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
  const preview = document.createElement("div");
  preview.className = "index-preview";
  preview.setAttribute("aria-hidden", "true");
  preview.innerHTML = "<img alt=''>";
  document.body.appendChild(preview);
  const img = preview.querySelector("img");
  let tx = 0, ty = 0, x = 0, y = 0, running = false;
  const tick = () => {
    x += (tx - x) * 0.16; y += (ty - y) * 0.16;
    preview.style.left = x + "px"; preview.style.top = y + "px";
    if (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) requestAnimationFrame(tick);
    else running = false;
  };
  list.addEventListener("mousemove", (e) => {
    // Park the photo in the open band between the titles and the category
    // column — never on top of the title being read — and follow only the
    // pointer's height, so it slides along the list like a loupe.
    const cat = list.querySelector(".index-row .ix-cat");
    const w = preview.offsetWidth || 260;
    const catLeft = cat && cat.offsetParent ? cat.getBoundingClientRect().left : window.innerWidth * 0.62;
    tx = catLeft - 32 - w / 2;
    ty = e.clientY;
    if (!x) { x = tx; y = ty; }           // first move: appear in place, no fly-in
    if (!running) { running = true; requestAnimationFrame(tick); }
  });
  list.addEventListener("mouseover", (e) => {
    const row = e.target.closest(".index-row");
    if (!row) return;
    list.classList.add("has-hover");
    list.querySelectorAll(".is-hover").forEach((r) => r.classList.remove("is-hover"));
    row.classList.add("is-hover");
    if (img.getAttribute("src") !== row.dataset.thumb) img.src = row.dataset.thumb;
    preview.classList.add("show");
  });
  list.addEventListener("mouseleave", () => {
    list.classList.remove("has-hover");
    list.querySelectorAll(".is-hover").forEach((r) => r.classList.remove("is-hover"));
    preview.classList.remove("show");
  });
}

/* Re-layout on resize (debounced) so rows always stay edge-to-edge. */
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (view === "gallery") renderWorks(current);
    const h = document.querySelector(".hero");
    heroThreshold = (h ? h.offsetHeight : window.innerHeight) - 70;
    fitFooterMark();
  }, 200);
});

/* ─── Switch Collection (+ theme) ───────────────────────────────────────────
   The new collection opens like a lens iris: a hexagon (the aperture in the
   seal) grows from the tab you pressed, revealing the other theme. Uses the
   View Transitions API; elsewhere a full-screen wipe does the scene change. */
let switching = false;

function applyCollection(key) {
  document.body.classList.toggle("mono", key === "mono");
  document.querySelectorAll(".switch-btn").forEach((btn) => {
    const on = btn.dataset.key === key;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
  updateNav();
  if (view === "index") renderIndex(key);
  else renderWorks(key);
}

function switchCollection(key, originEl) {
  if (key === current || switching) return;
  current = key;
  setThemeColor(key);

  if (REDUCED) { applyCollection(key); return; }

  if (document.startViewTransition) {
    const r = (originEl || document.querySelector(`.switch-btn[data-key="${key}"]`)).getBoundingClientRect();
    const root = document.documentElement;
    root.style.setProperty("--vt-x", r.left + r.width / 2 + "px");
    root.style.setProperty("--vt-y", r.top + r.height / 2 + "px");
    root.classList.add("switching");
    switching = true;
    const t = document.startViewTransition(() => {
      applyCollection(key);
      // the photos in view should already be developed when the iris opens
      document.querySelectorAll(".work-item").forEach((el) => {
        const b = el.getBoundingClientRect();
        if (b.top < window.innerHeight && b.bottom > 0) el.classList.add("in");
      });
    });
    t.finished.finally(() => { root.classList.remove("switching"); switching = false; });
    return;
  }

  switching = true;
  const wipe = document.getElementById("wipe");
  wipe.querySelector(".wipe-name").textContent = collections[key].name;
  wipe.classList.toggle("light", key === "color");
  wipe.classList.add("in");
  setTimeout(() => {
    applyCollection(key);
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
  // The strips below reuse the exact same srcset/sizes, so they resolve to the
  // same file and share one download instead of fetching a second size.
  const setAttr = imgSrcset(src);
  const finalImg = document.createElement("img");
  finalImg.className = "film-final";
  finalImg.src = src;
  if (setAttr) { finalImg.srcset = setAttr; finalImg.sizes = SIZES_OVERLAY; }
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
    inner.innerHTML = `<img src="${src}"${imgAttrs(src, SIZES_OVERLAY)} alt="">`;

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

  const pad = (n) => String(n).padStart(2, "0");
  overlay.innerHTML = `
    <div class="overlay-nav">
      <span class="label tech">${col.name} — ${p.titleNice}</span>
      <button class="overlay-close tech" onclick="closeOverlay()">Close ✕</button>
    </div>
    <div class="overlay-hero">
      <div class="overlay-hero-image" id="overlay-hero-image"></div>
      <div class="overlay-hero-text">
        <div class="overlay-num tech">${frameNo(idx)} / ${pad(total)}</div>
        <h2 class="overlay-title">${p.titleHTML}</h2>
        <p class="overlay-desc">${p.desc}</p>
        <dl class="facts tech">
          <div><dt>Category</dt><dd>${p.cat}</dd></div>
          <div><dt>Place</dt><dd>${p.loc}</dd></div>
          <div><dt>Date</dt><dd>${p.date}</dd></div>
          <div><dt>Collection</dt><dd>${col.name.charAt(0) + col.name.slice(1).toLowerCase()}</dd></div>
        </dl>
      </div>
    </div>
    <div class="overlay-footer">
      <button class="overlay-step" onclick="openOverlay('${key}', ${prevIdx})">← ${prev.titleNice}</button>
      <span class="overlay-count tech">${pad(idx + 1)} / ${pad(total)}</span>
      <button class="overlay-step" onclick="openOverlay('${key}', ${nextIdx})">${next.titleNice} →</button>
    </div>
  `;

  // Build inside a frame that shrink-wraps the photograph, so the watermark
  // always sits on the picture and never on the letterbox band beside it.
  const heroImageEl = document.getElementById("overlay-hero-image");
  const frame = document.createElement("div");
  frame.className = "photo-frame";
  heroImageEl.appendChild(frame);
  buildFilmReveal(frame, p.src);
  frame.insertAdjacentHTML("beforeend",
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
    const href = a.getAttribute("href");
    e.preventDefault();
    if (href.length < 2) return;            // bare "#" (e.g. Book) is handled elsewhere
    document.querySelector(href)?.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
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
  `<div class="page page-photo"><img src="${src}"${imgAttrs(src, SIZES_BOOK)} alt="" loading="lazy">
   ${pageNo ? `<span class="book-pageno left">${pageNo}</span>` : ""}</div>`;

const coverPage = (col) => `
  <div class="page page-text page-cover">
    <span class="label">Ruben Van Ruysseveldt — Photographic Volume</span>
    <h2 class="book-cover-title">${titleCase(col.name)}</h2>
    <p class="book-cover-sub">${col.sub}</p>
    <span class="book-cover-year">2021 — ${new Date().getFullYear()} · ${String(col.photos.length).padStart(2, "0")} plates</span>
  </div>`;

const detailPage = (p, idx, total, pageNo) => `
  <div class="page page-text">
    <div class="book-num">Plate ${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div>
    <h3 class="book-title">${p.titleHTML}</h3>
    <div class="book-divider"></div>
    <p class="book-desc">${p.desc}</p>
    <div class="book-fields">
      <div><div class="label">Category</div><div class="book-field-value">${p.cat}</div></div>
      <div><div class="label">Date</div><div class="book-field-value">${p.date}</div></div>
      <div><div class="label">Place</div><div class="book-field-value">${p.loc}</div></div>
    </div>
    <span class="book-pageno right">${pageNo}</span>
  </div>`;

const endPage = () => `
  <div class="page page-text page-end">
    <h3 class="book-title">The <em>end</em>.</h3>
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
  cursor.setAttribute("aria-hidden", "true");
  // autofocus brackets — the four corners lock in when you land on a photo
  cursor.innerHTML = `
    <svg viewBox="0 0 76 76" fill="none" stroke="currentColor" stroke-width="1">
      <path d="M1 15V1h14M61 1h14v14M75 61v14H61M15 75H1V61"/>
    </svg>
    <span>View</span>`;
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
      if (side) side.style.opacity = f;
    });
  }, { passive: true });
}


/* keep the mobile browser chrome in step with the active theme */
function setThemeColor(key) {
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", key === "mono" ? "#0A0A0A" : "#F1EEE7");
}

/* ─── Footer signature: set "Ruysseveldt" to exactly the page width ──────── */
function fitFooterMark() {
  const word = document.getElementById("footer-word");
  if (!word) return;
  const box = word.parentElement;
  const cs = getComputedStyle(box);
  const avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  box.style.fontSize = "100px";
  const w = word.getBoundingClientRect().width;
  if (w > 0) box.style.fontSize = (100 * avail / w).toFixed(2) + "px";
}

/* ─── Intro: the roll advances to its last frame while the seal settles ──── */
function runIntroCounter(introSkipped) {
  const total = collections.mono.photos.length + collections.color.photos.length;
  const totalEl = document.getElementById("intro-total");
  const frameEl = document.getElementById("intro-frame");
  if (totalEl) totalEl.textContent = String(total).padStart(2, "0");
  if (introSkipped || !frameEl) return;
  const start = performance.now() + 250, dur = 1100;
  const step = (t) => {
    const k = Math.min(1, Math.max(0, (t - start) / dur));
    const eased = 1 - Math.pow(1 - k, 3);
    frameEl.textContent = String(Math.round(eased * total)).padStart(2, "0");
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
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
  shuffleCollections();                // a different hang on every visit
  normalizeCollections();
  document.body.classList.add("mono"); // start in monochrome
  updateNav();                         // sync nav ink to the starting theme
  document.querySelectorAll(".switch-btn").forEach((btn) =>
    btn.addEventListener("click", () => switchCollection(btn.dataset.key, btn))
  );
  // counts on the tabs + the frame total in the statement, from the data
  document.querySelectorAll(".switch-count").forEach((el) => {
    el.textContent = String(collections[el.dataset.count].photos.length).padStart(2, "0");
  });
  const framesEl = document.getElementById("fact-frames");
  if (framesEl) framesEl.textContent = collections.mono.photos.length + collections.color.photos.length;

  renderWorks(current);
  initIndex();
  document.querySelectorAll(".view-btn[data-view]").forEach((btn) =>
    btn.addEventListener("click", () => setView(btn.dataset.view))
  );
  document.getElementById("nav-index")?.addEventListener("click", () => setView("index"));

  observeReveal();
  initGalleryCursor();
  initHeroMotion();
  initClock();
  fitFooterMark();
  if (document.fonts) document.fonts.ready.then(fitFooterMark);

  // keep the footer copyright year current
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // choreographed first paint: hero lines rise once the intro has slid away
  const introEl = document.getElementById("intro");
  const introSkipped = !introEl || introEl.classList.contains("skip");
  runIntroCounter(introSkipped);
  setTimeout(() => document.body.classList.add("loaded"), introSkipped ? 120 : 1650);

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
