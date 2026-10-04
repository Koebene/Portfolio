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

/* "Into the White" → "into-the-white": the photo's part of its web address.
   Taken from the title, never the position, because the order is shuffled. */
function slugify(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/* Fill in derived fields the rest of the code expects. */
function normalizeCollections() {
  Object.values(collections).forEach((col) => {
    const seen = new Set();
    col.photos.forEach((p) => {
      p.titleFlat = p.title.replace(/\n/g, " ");
      const nice = titleCase(p.title);
      p.titleNice = nice.replace(/\n/g, " ");          // one line (index, captions)
      p.titleHTML = nice.replace(/\n/g, "<br>");        // as authored (detail, book)
      let slug = slugify(p.titleFlat) || "photo";
      for (let n = 2; seen.has(slug); n++) slug = `${slugify(p.titleFlat)}-${n}`;
      seen.add(slug);
      p.slug = slug;
      p._ar = getAR(p);
    });
  });
}
const frameNo = (i) => "N° " + String(i + 1).padStart(2, "0");

/* Aspect ratio (width / height): the exact shape measured from the file by
   tools/build-image-variants.py when available (stored `ar` values can be
   estimates — First Weather was 12% off), else the stored `ar`, else 1. */
function getAR(p) {
  const real = window.imageRatios && window.imageRatios[p.src];
  if (real > 0) return real;
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

const SIZES_GRID    = "(max-width: 820px) 100vw, 75vw";
const SIZES_OVERLAY = "(max-width: 820px) 100vw, 92vw";
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
   sequence of spreads is re-seeded once at load, then held for the rest of the
   session — so resizing or switching collections never reshuffles the wall
   under the visitor, but a reload always gives a different arrangement. */
function shuffleCollections() {
  Object.values(collections).forEach((col) => {
    shuffle(col.photos, Math.random);
  });
}

/* ─── The sequence: the gallery paced like a photo book ─────────────────────
   Not a wall of equal tiles but spreads, the way a monograph is laid out: a
   large plate, a print with a line of wall text facing it, a pair hung at
   different heights. The spread is chosen from each photo's shape and a seed
   per visit — so any photo added later finds its place, and every visit hangs
   a little differently. Phones: one column, alternating insets. */
const kindOf = (p) => (p._ar >= 1.15 ? "L" : p._ar <= 0.92 ? "P" : "S");

// placement on the 12-column grid: [grid-column, alignment inside it]
const SPREADS = {
  hero:       { plates: [["1 / 13", "center"]] },
  "single-r": { plates: [["4 / 13", "end"]],   note: "1 / 4" },
  "single-l": { plates: [["1 / 10", "start"]], note: "10 / 13" },
  "port-r":   { plates: [["7 / 13", "end"]],   note: "3 / 7" },
  "port-l":   { plates: [["1 / 7", "start"]],  note: "7 / 11" },
  "pair-pp":  { plates: [["1 / 6", "start"], ["7 / 12", "start"]], drop: 1 },
  "pair-pl":  { plates: [["2 / 6", "start"], ["7 / 13", "start"]], drop: 0 },
  "pair-lp":  { plates: [["1 / 8", "start"], ["9 / 13", "end"]],   drop: 1 },
};

function sequence(photos, rand, mobile) {
  const out = [];
  let i = 0, side = rand() < 0.5 ? 1 : 0, sinceHero = 3, last = "";
  while (i < photos.length) {
    const a = photos[i], b = photos[i + 1];
    const ka = kindOf(a), kb = b ? kindOf(b) : null;
    if (mobile) {
      out.push({ type: ka === "L" ? "m-full" : side ? "m-inset-r" : "m-inset-l", items: [a] });
      if (ka !== "L") side ^= 1;
      i++;
      continue;
    }
    const canPair = b && !last.startsWith("pair") && rand() < 0.55;
    let type;
    if (ka === "L" && sinceHero >= 3 && rand() < 0.45) type = "hero";
    else if (canPair && ka !== "L" && kb !== "L") type = "pair-pp";
    else if (canPair && ka !== "L" && kb === "L") type = "pair-pl";
    else if (canPair && ka === "L" && kb !== "L") type = "pair-lp";
    else if (ka === "L") type = side ? "single-r" : "single-l";
    else type = side ? "port-r" : "port-l";
    const items = type.startsWith("pair") ? [a, b] : [a];
    out.push({ type, items });
    i += items.length;
    side ^= 1;
    last = type;
    sinceHero = type === "hero" ? 0 : sinceHero + 1;
  }
  return out;
}

const firstSentence = (s) => ((s || "").match(/^.*?[.!?](?=\s|$)/) || [s || ""])[0].trim();
const yearOf = (d) => String(d).replace(/^.*?(\d{4}).*$/, "$1");

/* Same breakpoint as the CSS: at or below it the gallery is a single column. */
const SINGLE_COLUMN = window.matchMedia("(max-width: 820px)");

/* Re-seeded per page load (see shuffleCollections) so the spreads change too —
   but read from here on every re-render, so resizes stay consistent. */
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

/* ─── Render the sequence ───────────────────────────────────────────────── */
let galleryMode = null;   // "desk" | "mob" — the layout only changes across the breakpoint
function renderWorks(key) {
  const col = collections[key];
  const grid = document.querySelector(".works");
  grid.innerHTML = "";
  col.photos.forEach((p) => (p._ar = getAR(p)));

  const mobile = SINGLE_COLUMN.matches;
  galleryMode = mobile ? "mob" : "desk";
  const rand = mulberry32(SEED[key]);       // same seed → same hang for this visit

  sequence(col.photos, rand, mobile).forEach((s) => {
    const conf = SPREADS[s.type];
    const spread = document.createElement("div");
    spread.className = `spread spread--${s.type}`;

    s.items.forEach((p, n) => {
      const i = col.photos.indexOf(p);
      const open = (e) => openOverlay(key, i, e && e.currentTarget.closest(".plate")?.querySelector(".plate-img"));
      const fig = document.createElement("figure");
      fig.className = "plate";
      if (conf) {
        fig.style.gridColumn = conf.plates[n][0];
        fig.classList.add("align-" + conf.plates[n][1]);
        if (conf.drop === n) fig.classList.add("drop");
      }
      fig.style.setProperty("--ar", p._ar.toFixed(4));
      fig.style.setProperty("--depth", (2 + rand() * 4).toFixed(1) + "%");   // parallax amount
      const caption = conf && conf.note ? "" : `
          <figcaption class="plate-cap tech" aria-hidden="true">
            <span class="plate-cap-num">${frameNo(i)}</span>
            <span class="plate-cap-title">${p.titleNice}</span>
            <span class="plate-cap-meta">${p.cat} — ${yearOf(p.date)}</span>
          </figcaption>`;
      fig.innerHTML = `
        <div class="plate-inner">
          <div class="plate-img work-item" role="button" tabindex="0"
               aria-label="${p.titleFlat} — ${p.cat}, ${p.date}. Open photograph.">
            <img src="${p.src}"${imgAttrs(p.src, SIZES_GRID)} alt="" loading="lazy" decoding="async">
            <img class="photo-mark" src="images/logo-watermark.svg" alt="" loading="lazy">
          </div>${caption}
        </div>`;
      const btn = fig.querySelector(".work-item");
      btn.dataset.idx = i;
      btn.style.transitionDelay = n * 140 + "ms";
      btn.addEventListener("click", open);
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(e); }
      });
      fig.querySelector(".plate-cap")?.addEventListener("click", open);
      fig.dataset.tone = (window.imageTones && window.imageTones[p.src]) || "";
      spread.appendChild(fig);
      if (REDUCED) btn.classList.add("in");
      else workIO.observe(btn);
    });

    // a single print gets wall text on the facing columns, like a book page
    if (conf && conf.note) {
      const p = s.items[0];
      const i = col.photos.indexOf(p);
      const note = document.createElement("div");
      note.className = "plate-note reveal";
      note.style.gridColumn = conf.note;
      note.setAttribute("aria-hidden", "true");
      note.dataset.tone = (window.imageTones && window.imageTones[p.src]) || "";
      note.innerHTML = `
        <span class="tech">${frameNo(i)}</span>
        <p class="note-title">${p.titleNice}</p>
        <p class="note-text">${firstSentence(p.desc)}</p>
        <span class="tech note-meta">${p.cat} · ${p.loc} · ${yearOf(p.date)}</span>`;
      note.addEventListener("click", () => openOverlay(key, i, spread.querySelector(".plate-img")));
      spread.appendChild(note);
      observer.observe(note);
    }
    grid.appendChild(spread);
  });

  document.querySelector(".works-count").textContent = `${String(col.photos.length).padStart(2, "0")} frames`;
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
        data-tone="${(window.imageTones && window.imageTones[p.src]) || ""}"
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
  // fly from what's on screen: the floating preview (desktop) or the row's thumbnail (phone)
  const open = (row) => {
    const preview = document.querySelector(".index-preview.show");
    openOverlay(current, +row.dataset.i, preview || row.querySelector(".ix-thumb"));
  };
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

/* Resize (debounced): re-sequence only across the phone breakpoint, keep the
   photo stage fitted, refit the footer signature. */
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // the spreads are CSS-sized; only crossing the phone breakpoint re-sequences
    if (view === "gallery" && galleryMode !== (SINGLE_COLUMN.matches ? "mob" : "desk")) renderWorks(current);
    sizeStageFrame();
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
  document.body.style.removeProperty("--amb");   // a Chroma tint never carries over
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

/* ─── Addresses: every photograph (and the book) has its own link ──────────
   #/chroma/the-visitor opens that photo; #/book/monochrome opens the book.
   Opening adds ONE history entry and stepping to the next photo only replaces
   it — so the back gesture on a phone closes the photo instead of leaving the
   site, and a copied or shared link opens exactly that picture. */
const COLL_SLUG = { mono: "monochrome", color: "chroma" };
const SLUG_COLL = { monochrome: "mono", chroma: "color" };
const BASE_TITLE = document.title;
const baseURL = () => location.pathname + location.search;
let routing = false;   // true while we're following the address bar / history

function parseRoute(hash) {
  const m = /^#\/([a-z]+)\/([a-z0-9-]+)\/?$/.exec(hash || "");
  if (!m) return null;
  if (m[1] === "book") return SLUG_COLL[m[2]] ? { book: true, key: SLUG_COLL[m[2]] } : null;
  const key = SLUG_COLL[m[1]];
  if (!key) return null;
  const idx = collections[key].photos.findIndex((p) => p.slug === m[2]);
  return idx >= 0 ? { key, idx } : null;
}
const photoURL = (key, p) => `#/${COLL_SLUG[key]}/${p.slug}`;

/* put the page in the collection a link points to — instantly, no iris */
function showCollection(key) {
  if (key === current) return;
  current = key;
  setThemeColor(key);
  applyCollection(key);
}

window.addEventListener("popstate", () => {
  const r = parseRoute(location.hash);
  routing = true;
  try {
    if (r && r.book) {
      closeOverlay(true);
      showCollection(r.key);
      if (!bookEl.classList.contains("open")) openBook();
    } else if (r) {
      closeBook(true);
      showCollection(r.key);
      openOverlay(r.key, r.idx);
    } else {
      closeOverlay(true);
      closeBook(true);
    }
  } finally {
    routing = false;
  }
});

/* Share the photo that's open: the phone's own share sheet where there is one,
   otherwise copy the link. */
async function sharePhoto(btn) {
  if (!overlayState) return;
  const p = collections[overlayState.key].photos[overlayState.idx];
  const url = location.href;
  const title = `${p.titleNice} — Ruben Van Ruysseveldt`;
  try {
    if (navigator.share) { await navigator.share({ title, url }); return; }
    await navigator.clipboard.writeText(url);
    btn.textContent = "Link copied";
    setTimeout(() => { btn.textContent = "Share"; }, 2000);
  } catch (e) { /* share sheet dismissed — nothing to do */ }
}

/* ─── Project Overlay ───────────────────────────────────────────────────── */
const overlay = document.getElementById("overlay");
let overlayState = null;       // { key, idx } while the overlay is open
let overlayReturnFocus = null; // element to refocus when it closes

/* The stage frame is sized from the photo's exact shape (not from the loaded
   file), so it is right before any pixels arrive — needed for the flight in. */
function sizeStageFrame() {
  const stage = overlay.querySelector(".stage");
  const frame = overlay.querySelector(".photo-frame");
  if (!stage || !frame || !overlayState) return;
  const ar = getAR(collections[overlayState.key].photos[overlayState.idx]);
  const cs = getComputedStyle(stage);
  const W = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const H = SINGLE_COLUMN.matches
    ? window.innerHeight * 0.72
    : stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  let w = W, h = w / ar;
  if (h > H) { h = H; w = h * ar; }
  frame.style.width = Math.round(w) + "px";
  frame.style.height = Math.round(h) + "px";
}

/* After the flight (which reuses the small gallery file), swap in the sharp
   version for the stage — decoded first, so the swap is invisible. */
function upgradeStageImage(src) {
  const img = overlay.querySelector(".film-final");
  if (!img) return;
  const set = imgSrcset(src);
  if (!set) { img.src = src; return; }
  const pre = new Image();
  pre.sizes = SIZES_OVERLAY; pre.srcset = set; pre.src = src;
  pre.decode().then(() => {
    if (img.isConnected) { img.sizes = SIZES_OVERLAY; img.srcset = set; }
  }).catch(() => {});
}

const inView = (el) => {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
};

/* where a photo lives on the page right now (to fly back to), if anywhere */
function photoHome(key, idx) {
  if (key !== current) return null;
  if (view === "gallery") return document.querySelector(`.works .plate-img[data-idx="${idx}"]`);
  return document.querySelector(`.index-row[data-i="${idx}"] .ix-thumb`);
}

/* The photo view. The photograph comes first — a full-screen stage, the story
   below it. Opened from the page, the picture flies from where it was clicked
   onto the stage (View Transitions); stepping to the next photo keeps the
   film-roll advance instead: the roll moving on to the next frame. */
function openOverlay(key, idx, sourceEl) {
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

  // one history entry per opening; next/prev only rewrite it
  if (!routing) {
    if (wasOpen) history.replaceState({ photo: true }, "", photoURL(key, p));
    else history.pushState({ photo: true }, "", photoURL(key, p));
  }
  document.title = `${p.titleNice} — ${BASE_TITLE}`;

  const srcImg = sourceEl && (sourceEl.tagName === "IMG" ? sourceEl : sourceEl.querySelector("img"));
  const fly = !wasOpen && !REDUCED && !!document.startViewTransition && inView(sourceEl) &&
              srcImg && srcImg.complete && srcImg.naturalWidth > 0;

  const pad = (n) => String(n).padStart(2, "0");
  const collName = titleCase(col.name);
  const build = () => {
    overlay.innerHTML = `
      <div class="overlay-nav">
        <span class="label tech">${collName} — ${p.titleNice}</span>
        <div class="overlay-actions">
          <button class="overlay-share tech" onclick="sharePhoto(this)">Share</button>
          <button class="overlay-close tech" onclick="closeOverlay()">Close ✕</button>
        </div>
      </div>
      <section class="stage">
        <div class="photo-frame"></div>
        <button class="stage-zone prev" data-label="Prev" tabindex="-1" aria-hidden="true" onclick="openOverlay('${key}', ${prevIdx})"></button>
        <button class="stage-zone next" data-label="Next" tabindex="-1" aria-hidden="true" onclick="openOverlay('${key}', ${nextIdx})"></button>
        <div class="stage-caption">
          <span class="tech">${frameNo(idx)} / ${pad(total)}</span>
          <span class="stage-title">${p.titleNice}</span>
          <button class="stage-more tech" onclick="this.closest('.overlay').querySelector('.story').scrollIntoView({behavior:'smooth'})">Story ↓</button>
        </div>
      </section>
      <section class="story">
        <div class="story-head">
          <span class="tech overlay-num">${frameNo(idx)} / ${pad(total)} — ${collName}</span>
          <h2 class="overlay-title">${p.titleHTML}</h2>
        </div>
        <div class="story-body">
          <p class="overlay-desc">${p.desc}</p>
          <dl class="facts tech">
            <div><dt>Category</dt><dd>${p.cat}</dd></div>
            <div><dt>Place</dt><dd>${p.loc}</dd></div>
            <div><dt>Date</dt><dd>${p.date}</dd></div>
            <div><dt>Collection</dt><dd>${collName}</dd></div>
          </dl>
        </div>
      </section>
      <div class="overlay-footer">
        <button class="overlay-step" onclick="openOverlay('${key}', ${prevIdx})">← ${prev.titleNice}</button>
        <span class="overlay-count tech">${pad(idx + 1)} / ${pad(total)}</span>
        <button class="overlay-step" onclick="openOverlay('${key}', ${nextIdx})">${next.titleNice} →</button>
      </div>`;
    // Chroma: the page takes on a faint tint of the photograph's own colour
    const tone = window.imageTones && window.imageTones[p.src];
    if (tone) overlay.style.setProperty("--tone", tone);
    else overlay.style.removeProperty("--tone");
    const frame = overlay.querySelector(".photo-frame");
    sizeStageFrame();
    let finalImg = null;
    if (fly) {
      // land on the very file already on screen, then sharpen after the flight
      finalImg = document.createElement("img");
      finalImg.className = "film-final show";
      finalImg.alt = "";
      finalImg.src = srcImg.currentSrc || srcImg.src;
      frame.appendChild(finalImg);
      frame.style.viewTransitionName = "photo";
    } else {
      buildFilmReveal(frame, p.src);
    }
    frame.insertAdjacentHTML("beforeend", '<img class="photo-mark" src="images/logo-watermark.svg" alt="">');
    overlay.scrollTop = 0;
    overlay.setAttribute("aria-hidden", "false");
    if (!wasOpen) setChromeInert(true);
    document.body.style.overflow = "hidden";
    return finalImg;
  };

  if (fly) {
    const root = document.documentElement;
    root.classList.add("morphing");
    sourceEl.style.viewTransitionName = "photo";
    const t = document.startViewTransition(async () => {
      sourceEl.style.viewTransitionName = "";
      const img = build();
      overlay.classList.add("open");
      try { await img.decode(); } catch (e) { /* show it anyway */ }
    });
    t.finished.finally(() => {
      root.classList.remove("morphing");
      const frame = overlay.querySelector(".photo-frame");
      if (frame) frame.style.viewTransitionName = "";
      upgradeStageImage(p.src);
      overlay.querySelector(".overlay-close")?.focus({ preventScroll: true });
    });
    return;
  }

  build();
  requestAnimationFrame(() => {
    overlay.classList.add("open");
    overlay.querySelector(".overlay-close")?.focus({ preventScroll: true });
  });
}

function closeOverlay(fromHistory) {
  if (!overlay.classList.contains("open")) return;
  // Opening pushed a history entry: step back over it, so "forward" can reopen
  // the photo. The popstate handler then calls us again to do the closing.
  if (fromHistory !== true && history.state && history.state.photo) { history.back(); return; }

  const finish = () => {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    overlayState = null;
    document.body.style.overflow = "";
    setChromeInert(false);
    if (overlayReturnFocus && overlayReturnFocus.focus) overlayReturnFocus.focus({ preventScroll: true });
    overlayReturnFocus = null;
    if (location.hash.startsWith("#/")) history.replaceState(null, "", baseURL());
    document.title = BASE_TITLE;
  };

  // fly the photograph back to its place on the page, if that place is in view
  const home = overlayState && photoHome(overlayState.key, overlayState.idx);
  const frame = overlay.querySelector(".photo-frame");
  if (!REDUCED && document.startViewTransition && frame && inView(home) && overlay.scrollTop < 80) {
    const root = document.documentElement;
    root.classList.add("morphing");
    frame.style.viewTransitionName = "photo";
    const t = document.startViewTransition(() => {
      frame.style.viewTransitionName = "";
      home.style.viewTransitionName = "photo";
      finish();
    });
    t.finished.finally(() => { home.style.viewTransitionName = ""; root.classList.remove("morphing"); });
    return;
  }
  finish();
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
  if (!routing) history.pushState({ book: true }, "", `#/book/${COLL_SLUG[current]}`);
  document.title = `${titleCase(collections[current].name)} — Photo Book — ${BASE_TITLE}`;
  bookEl.setAttribute("aria-hidden", "false");
  setChromeInert(true);
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => {
    bookEl.classList.add("open");
    document.querySelector(".book-close")?.focus();
  });
}

function closeBook(fromHistory) {
  if (!bookEl.classList.contains("open")) return;
  if (fromHistory !== true && history.state && history.state.book) { history.back(); return; }
  bookEl.classList.remove("open");
  bookEl.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  setChromeInert(false);
  if (bookReturnFocus && bookReturnFocus.focus) bookReturnFocus.focus();
  bookReturnFocus = null;
  if (location.hash.startsWith("#/")) history.replaceState(null, "", baseURL());
  document.title = BASE_TITLE;
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

  const label = cursor.querySelector("span");
  const grid = document.querySelector(".works");
  grid.addEventListener("mouseover", (e) => {
    if (e.target.closest(".work-item")) { label.textContent = "View"; cursor.classList.add("show"); }
  });
  grid.addEventListener("mouseout", (e) => {
    if (!e.relatedTarget || !e.relatedTarget.closest(".work-item")) cursor.classList.remove("show");
  });
  // on the photo stage the brackets read Prev / Next over the left and right thirds
  overlay.addEventListener("mouseover", (e) => {
    const zone = e.target.closest(".stage-zone");
    if (zone) { label.textContent = zone.dataset.label; cursor.classList.add("show"); }
    else cursor.classList.remove("show");
  });
  overlay.addEventListener("mouseleave", () => cursor.classList.remove("show"));
  // never linger on the page when a photo or the book opens
  document.addEventListener("click", (e) => { if (!e.target.closest(".stage-zone")) cursor.classList.remove("show"); });
}

/* ─── The statement develops as you read it ─────────────────────────────────
   Each word starts as a faint latent image and comes up to full ink as the
   line scrolls through the screen — a print developing in the tray. */
function initDeveloping() {
  const el = document.querySelector(".manifesto-lead");
  if (!el || REDUCED) return;
  const wrap = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement("span");
          w.className = "w";
          w.textContent = part;
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        wrap(n);
      }
    });
  };
  wrap(el);
  const words = [...el.querySelectorAll(".w")];
  const n = words.length;
  let raf = null;
  const update = () => {
    raf = null;
    const r = el.getBoundingClientRect(), vh = window.innerHeight;
    // 0 as the line enters the lower part of the screen, 1 once it's well up
    const p = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.5 + r.height * 0.6)));
    words.forEach((w, i) => {
      const t = Math.min(1, Math.max(0, (p * (n + 1.5) - i) / 1.5));
      w.style.opacity = (0.12 + 0.88 * t).toFixed(3);
    });
  };
  window.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* ─── Chroma: the paper takes on the colour of what you look at ─────────────
   Hovering a photograph in the colour collection eases the page toward a faint
   tint of that photo's own colour (measured by the image script). Monochrome
   stays a true darkroom. */
function initAmbient() {
  let timer = null;
  const setTone = (tone) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (tone && !document.body.classList.contains("mono")) document.body.style.setProperty("--amb", tone);
      else document.body.style.removeProperty("--amb");
    }, tone ? 160 : 450);
  };
  [document.querySelector(".works"), document.querySelector(".index")].forEach((area) => {
    if (!area) return;
    area.addEventListener("mouseover", (e) => {
      const el = e.target.closest("[data-tone]");
      if (el && el.dataset.tone) setTone(el.dataset.tone);
    });
    area.addEventListener("mouseleave", () => setTone(null));
  });
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

/* ─── Swipe (phones): left/right through photos and book pages ─────────────
   Only a clearly horizontal drag counts; vertical scrolling is left to the
   browser (touch-action: pan-y in the CSS). `follow` lets the photo trail the
   finger a little so the gesture feels physical. */
function addSwipe(el, { within, onNext, onPrev, follow }) {
  let x0 = 0, y0 = 0, dx = 0, active = false, horizontal = null;
  const reset = () => { active = false; horizontal = null; dx = 0; };
  el.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1 || (within && !e.target.closest(within))) return;
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; dx = 0;
    active = true; horizontal = null;
  }, { passive: true });
  el.addEventListener("touchmove", (e) => {
    if (!active) return;
    dx = e.touches[0].clientX - x0;
    const dy = e.touches[0].clientY - y0;
    if (horizontal === null && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) horizontal = Math.abs(dx) > Math.abs(dy) * 1.2;
    if (horizontal && follow) follow(dx);
  }, { passive: true });
  el.addEventListener("touchend", () => {
    if (!active) return;
    const go = horizontal && Math.abs(dx) > 56;
    const dir = dx;
    reset();
    if (go) (dir < 0 ? onNext : onPrev)();
    else if (follow) follow(0, true);
  });
  el.addEventListener("touchcancel", () => { if (active && follow) follow(0, true); reset(); });
}

function initSwipe() {
  const step = (d) => {
    if (!overlayState) return;
    const n = collections[overlayState.key].photos.length;
    openOverlay(overlayState.key, (overlayState.idx + d + n) % n);
  };
  addSwipe(overlay, {
    within: ".stage",
    onNext: () => step(1),
    onPrev: () => step(-1),
    follow: (dx, release) => {
      const f = overlay.querySelector(".photo-frame");
      if (!f) return;
      f.style.transition = release ? "transform 0.45s var(--ease), opacity 0.45s var(--ease)" : "none";
      f.style.transform = dx ? `translateX(${dx * 0.35}px)` : "";
      f.style.opacity = dx ? String(Math.max(0.55, 1 - Math.abs(dx) / 700)) : "";
    },
  });
  addSwipe(document.querySelector(".book"), { onNext: bookNext, onPrev: bookPrev });
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
  initDeveloping();
  initAmbient();
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

  initSwipe();

  // Arrived through a shared link? Open that photo (or the book) straight
  // away. The link's own entry becomes the plain page underneath, so the
  // back gesture closes the photo and leaves the visitor on the site.
  const route = parseRoute(location.hash);
  if (route) {
    history.replaceState(null, "", baseURL());
    showCollection(route.key);
    if (route.book) openBook();
    else openOverlay(route.key, route.idx);
  }
});
