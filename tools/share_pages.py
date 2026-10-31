"""A real web page per photo, so a shared link previews the photograph itself.

Why: the site addresses a photo as  …/#/chroma/sea-level . Link previews
(WhatsApp, Instagram, iMessage, Facebook…) never look past the "#", so every
shared photo showed the general site card. This writes, for every photo,

    chroma/sea-level/index.html   →  …/chroma/sea-level
    chroma/sea-level/card.jpg        its preview image (1200×630)

The page carries the photo's title, the first line of its poem and its card
for the preview apps, and sends a visitor straight on to the photo on the site.
The Share button in the photo view hands out these addresses.

It runs automatically at the end of  python tools/build-image-variants.py ,
or on its own:  python tools/share_pages.py
The monochrome/ and chroma/ folders are generated — don't edit them by hand.
"""
import hashlib
import html
import json
import os
import re
import shutil

from PIL import Image, ImageEnhance, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHOTOS = os.path.join(ROOT, "js", "photos.js")
SEAL = os.path.join(ROOT, "tools", "seal-watermark.png")

COLL_SLUG = {"mono": "monochrome", "color": "chroma"}      # as in main.js
PAPER = {"mono": (10, 10, 10), "color": (241, 238, 231)}   # the two page themes
INK = {"mono": "#ECEAE4", "color": "#151513"}
CARD_W, CARD_H, MAT = 1200, 630, 36

SMALL_WORDS = {"a", "an", "and", "at", "by", "for", "in", "of", "on", "or", "the", "to", "with"}


def title_case(s):                       # same rules as titleCase() in main.js
    out, first = [], True
    for w in re.split(r"(\s+)", s.lower()):
        if not w or w.isspace():
            out.append(w)
            continue
        out.append(w if (not first and w in SMALL_WORDS) else w[:1].upper() + w[1:])
        first = False
    return "".join(out)


def slugify(s):                          # same rules as slugify() in main.js
    import unicodedata
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def first_sentence(s):                   # same as firstSentence() in main.js
    t = re.sub(r"\s+", " ", s or "").strip()
    m = re.match(r"^.*?[.!?](?=\s|$)", t)
    return m.group(0) if m else t


def load_photos():
    """Read js/photos.js — a plain JS object, so each field is found by name."""
    src = open(PHOTOS, encoding="utf8").read()
    sections = sorted((re.search(rf"\b{k}\s*:\s*\{{", src).start(), k) for k in COLL_SLUG)
    field = re.compile(r'(\w+)\s*:\s*("(?:[^"\\]|\\.)*"|-?[\d.]+)')
    photos = []
    for m in re.finditer(r"\{([^{}]*\btitle\s*:[^{}]*)\}", src):
        key = [k for start, k in sections if start < m.start()][-1]
        p = {f.group(1): (json.loads(f.group(2)) if f.group(2).startswith('"') else float(f.group(2)))
             for f in field.finditer(m.group(1))}
        p["key"] = key
        photos.append(p)
    # unique addresses per collection, exactly as normalizeCollections() does
    seen = {k: set() for k in COLL_SLUG}
    for p in photos:
        base = slugify(p["title"].replace("\n", " ")) or "photo"
        slug, n = base, 2
        while slug in seen[p["key"]]:
            slug, n = f"{base}-{n}", n + 1
        seen[p["key"]].add(slug)
        p["slug"] = slug
    return photos


def site_url():
    """The site's own address, from the canonical link in index.html."""
    page = open(os.path.join(ROOT, "index.html"), encoding="utf8").read()
    return re.search(r'<link rel="canonical" href="([^"]+)"', page).group(1).rstrip("/")


def make_card(p, out_path):
    """The photo whole, matted on its collection's paper, seal in the corner."""
    card = Image.new("RGB", (CARD_W, CARD_H), PAPER[p["key"]])
    with Image.open(os.path.join(ROOT, p["src"])) as im:
        im = im.convert("RGB")
        im.thumbnail((CARD_W - 2 * MAT, CARD_H - 2 * MAT), Image.LANCZOS)
    if p["key"] == "mono":               # the page shows Monochrome this way
        im = ImageEnhance.Contrast(im.convert("L").convert("RGB")).enhance(1.05)
    x, y = (CARD_W - im.width) // 2, (CARD_H - im.height) // 2
    card.paste(im, (x, y))

    seal = Image.open(SEAL).convert("RGBA")
    size = max(48, round(im.width * 0.075))
    seal = seal.resize((size, size), Image.LANCZOS)
    alpha = seal.getchannel("A").point(lambda a: round(a * 0.5))
    shadow = Image.new("RGBA", seal.size, (0, 0, 0, 0))
    shadow.putalpha(seal.getchannel("A").point(lambda a: round(a * 0.35)).filter(ImageFilter.GaussianBlur(2)))
    seal.putalpha(alpha)
    sx, sy = x + im.width - size - 14, y + im.height - size - 12
    card.paste(shadow, (sx, sy + 1), shadow)
    card.paste(seal, (sx, sy), seal)

    card.save(out_path, "JPEG", quality=84, optimize=True, progressive=True)


PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — Ruben Van Ruysseveldt</title>
  <meta name="description" content="{desc}">
  <meta name="robots" content="noindex">
  <!-- Generated by tools/share_pages.py — a shared link to one photograph. -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Ruben Van Ruysseveldt">
  <meta property="og:title" content="{title} — Ruben Van Ruysseveldt">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{image}">
  <meta property="og:image:width" content="{w}">
  <meta property="og:image:height" content="{h}">
  <meta property="og:image:alt" content="{title} — a photograph by Ruben Van Ruysseveldt">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title} — Ruben Van Ruysseveldt">
  <meta name="twitter:description" content="{desc}">
  <meta name="twitter:image" content="{image}">
  <meta name="theme-color" content="{paper}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <script>location.replace("{target}");</script>
  <style>
    body {{ margin: 0; min-height: 100vh; display: grid; place-items: center;
      background: {paper}; color: {ink}; font: 17px/1.6 Georgia, serif; }}
    a {{ color: inherit; }}
  </style>
</head>
<body>
  <p><a href="{target}">{title} — view the photograph</a></p>
</body>
</html>
"""


def build():
    """Write every photo's page + card; return how many were written."""
    base = site_url()
    photos = load_photos()
    for folder in COLL_SLUG.values():    # generated output: start clean, so
        shutil.rmtree(os.path.join(ROOT, folder), ignore_errors=True)   # removed photos go too
    for p in photos:
        path = f"{COLL_SLUG[p['key']]}/{p['slug']}"
        out_dir = os.path.join(ROOT, *path.split("/"))
        os.makedirs(out_dir)
        card = os.path.join(out_dir, "card.jpg")
        make_card(p, card)
        version = hashlib.sha1(open(card, "rb").read()).hexdigest()[:8]   # new card → new URL for the apps' caches
        paper = "#%02X%02X%02X" % PAPER[p["key"]]
        page = PAGE.format(
            title=html.escape(title_case(p["title"]).replace("\n", " ")),
            desc=html.escape(first_sentence(p.get("desc", ""))),
            url=f"{base}/{path}",
            image=f"{base}/{path}/card.jpg?v={version}",
            w=CARD_W, h=CARD_H, paper=paper, ink=INK[p["key"]],
            target=f"/#/{path}",
        )
        with open(os.path.join(out_dir, "index.html"), "w", encoding="utf8", newline="\n") as f:
            f.write(page)
    return len(photos)


if __name__ == "__main__":
    print(f"share pages written: {build()}")
