/* ============================================================================
   PHOTO DATABASE  —  this is the only file you edit to manage your photos.
   ----------------------------------------------------------------------------
   ➤ TO ADD A PHOTO
       1. Drop the image file into the  /images  folder.
       2. Copy one { ... } block below, paste it where you want it to appear,
          and change the fields.
       3. Put it under "mono" (black & white) or "color" (colour).

   ➤ TO REMOVE A PHOTO
       Delete its { ... } block.

   ➤ TO REORDER
       Move the { ... } blocks up or down — the order here is the order on site.

   FIELDS
       title : the big title. Use  \n  to split it onto two lines.
       src   : path to the image, e.g.  "images/myphoto.jpg"
       date  : free text — "2024", "7 Sept 2023", "Summer '22" …
       cat   : a category label — Portrait, Street, Landscape …
       loc   : where it was taken — "Ghent, BE"
       ar    : the photo's shape = width ÷ height.
               landscape ≈ 1.5   |   square = 1   |   portrait ≈ 0.7
               (a rough value is fine — it only affects the grid sizing)
       desc  : the text shown on the photo's own page.
   ============================================================================ */

window.collections = {

  /* ─────────────  BLACK & WHITE  ───────────── */
  mono: {
    name: "MONOCHROME",
    sub: "Black & white — light, form & stillness",
    photos: [

      {
        title: "FIRST\nWEATHER",
        src:   "images/hero.jpeg",
        date:  "7 Sept 2023",
        cat:   "Portrait",
        loc:   "Home",
        ar:    0.82,
        desc:  "Long before we are given the words for what we feel, we learn to weather it. Here our eldest daughter stands inside a storm of her own — brow gathered, gaze turned somewhere inward — meeting an emotion she cannot yet name. There is a quiet dignity in that struggle: the first, unguarded work of becoming someone who feels deeply.",
      },
      {
        title: "STILL\nWATERS",
        src:   "images/moulins.jpeg",
        date:  "2024",
        cat:   "Architecture",
        loc:   "Ruisbroek, BE",
        ar:    0.97,
        desc:  "The old Moulins de Ruysbroeck stands mirrored in the quiet canal, its brick face weathered by a century of grain and water. Stripped of colour, the mill becomes pure structure and memory — a monument to a working past, now resting in its own reflection.",
      },
      {
        title: "CHAPEL IN\nTHE MIST",
        src:   "images/chapel.jpeg",
        date:  "2024",
        cat:   "Landscape",
        loc:   "Belgium",
        ar:    0.78,
        desc:  "A lone chapel waits where the forest dissolves into fog — its pale façade glowing against a world that is losing its outlines. The path is empty, yet someone laid these stones, climbed these steps, and believed enough to build. What did they come here to ask, and is anyone still listening? The mist keeps its answer, and leaves the question to us.",
      },
      {
        title: "MIRROR\nWORLD",
        src:   "images/mirrortree.jpeg",
        date:  "2024",
        cat:   "Abstract",
        loc:   "Belgium",
        ar:    0.63,
        desc:  "A tree hangs upside-down in the skin of the water, its branches reaching down instead of up. Only the drifting leaves break the illusion — just enough to remind us it is one. We trust what we see, yet here the world is perfectly, quietly inverted, and somehow more beautiful for being wrong.",
      },
      {
        title: "CITY\nLINES",
        src:   "images/blurrycitylines.jpeg",
        date:  "2024",
        cat:   "Street",
        loc:   "Ghent, BE",
        ar:    1.78,
        desc:  "The grain of the city pushed to its edges. Tram lines and wires converge on an old tower while strangers cross paths they will never remember. A street is a thousand private journeys laid over the same worn stones — motion that, for a moment, looks like a single living thing.",
      },
      {
        title: "FIRST\nSLEEP",
        src:   "images/baby.jpeg",
        date:  "2025",
        cat:   "Family",
        loc:   "Home",
        ar:    1.0,
        desc:  "Only days into the world, and already so much trust. Wrapped and watched over by a quiet circle of guardians, our newest arrival sleeps the deep, weightless sleep that only the very new still know — before the world asks anything of them at all.",
      },
      {
        title: "LOW\nTIDE",
        src:   "images/jettyboat.jpeg",
        date:  "2024",
        cat:   "Landscape",
        loc:   "Wadden Sea, NL",
        ar:    0.58,
        desc:  "Down at the level of the planks, the jetty becomes a vanishing line — rope, shadow and weathered wood pulled tight toward a single moored boat. A study in perspective, and in the patience of things that spend their lives waiting by the sea.",
      },
      {
        title: "HOUSE\nLIGHTS",
        src:   "images/cafe.jpeg",
        date:  "2024",
        cat:   "Documentary",
        loc:   "Ghent, BE",
        ar:    1.33,
        desc:  "Chandeliers, worn wood and the low murmur of a full room. The grand café endures as one of the last truly public living rooms — a place to be alone among others, watching the light catch a hundred small conversations at once.",
      },
      {
        title: "LAST\nTRAIN",
        src:   "images/station.jpeg",
        date:  "2024",
        cat:   "Night",
        loc:   "Belgium",
        ar:    0.85,
        desc:  "An empty station holds its breath between trains. The stairs descend into a pool of lamplight, platforms one and two waiting in the cold for passengers who have already gone home. Night turns even the busiest places into something solitary and still.",
      },
      {
        title: "SHOES IN\nTHE SKY",
        src:   "images/festival.jpeg",
        date:  "2023",
        cat:   "Festival",
        loc:   "Belgium",
        ar:    1.33,
        desc:  "Hundreds of shoes flung skyward above the festival crowd — a strange constellation of summers past. Every pair is a dare, a memory, a night someone decided to leave a little of themselves behind. In black and white the chaos turns almost ceremonial.",
      },

    ],
  },

  /* ─────────────  COLOUR  ───────────── */
  color: {
    name: "CHROMA",
    sub: "Colour — saturated, warm & alive",
    photos: [

      {
        title: "THE\nTHINKER",
        src:   "images/timo_thinker_spain.jpeg",
        date:  "2025",
        cat:   "Landscape",
        loc:   "Spain",
        ar:    0.75,
        desc:  "A solitary figure against an open sky. Standing at the edge of stone and cloud, the image holds a single quiet moment of scale — one person measured against the vastness of the landscape.",
      },
      {
        title: "HIDDEN\nCOVE",
        src:   "images/boatescape.jpeg",
        date:  "2024",
        cat:   "Landscape",
        loc:   "Costa Brava, ES",
        ar:    1.0,
        desc:  "A single boat rests in a turquoise calanque, cradled by pine and pale limestone. The Mediterranean hides these pockets of stillness between its cliffs — places that quietly ask you to cut the engine, drop anchor, and simply stay a while.",
      },
      {
        title: "AGAINST\nTHE WIND",
        src:   "images/vlieger.jpeg",
        date:  "2024",
        cat:   "Family",
        loc:   "Zeeland, NL",
        ar:    0.71,
        desc:  "A small figure, a length of string, and a whole sky to hold on to. Flying a kite is a child's first negotiation with a force far larger than herself — the wind pulls, the hand holds, and for one bright moment the two of them agree.",
      },
      {
        title: "THE\nCROSSING",
        src:   "images/ropey.jpeg",
        date:  "2024",
        cat:   "Travel",
        loc:   "Wadden Sea, NL",
        ar:    0.56,
        desc:  "Weathered planks and frayed rope lead the eye out toward open water. Every pier is a small act of faith — a wooden line drawn over the unknown, daring you to walk to its end and look at what waits beyond.",
      },
      {
        title: "FADED\nGRANDEUR",
        src:   "images/chateau.jpeg",
        date:  "2023",
        cat:   "Architecture",
        loc:   "Belgium",
        ar:    1.52,
        desc:  "A brick château holds its ground against the turning year, turrets mirrored in a still pond fringed with reeds. Autumn softens everything — the colours, the stone, and the quiet reminder that grandeur, too, is only ever borrowed from time.",
      },
      {
        title: "UNDER\nTHE ARCHES",
        src:   "images/lisbon.jpeg",
        date:  "2023",
        cat:   "Travel",
        loc:   "Lisbon, PT",
        ar:    0.64,
        desc:  "A rhythm of vaulted arches marches toward the light while a lone figure walks its length. Cities keep these cool, echoing corridors as a pause between the heat and the crowd — geometry you can move through, repeating like a held note.",
      },
      {
        title: "BASS IN\nTHE PINES",
        src:   "images/soundsystem.jpeg",
        date:  "2023",
        cat:   "Festival",
        loc:   "Belgium",
        ar:    0.56,
        desc:  "Stacked speakers under the pines, a wall of sound breaking against the trees. Bodies move loose in the summer heat while the bass quietly rearranges the air — a small, sweltering church of rhythm where nobody stays a stranger for long.",
      },
      {
        title: "HOME\nCOURT",
        src:   "images/basketcourt.jpeg",
        date:  "2023",
        cat:   "Travel",
        loc:   "Belgian Coast",
        ar:    0.75,
        desc:  "Two empty hoops keep watch over the sand as the day burns out over the sea. No game, no crowd — just the quiet geometry of a place that has seen a thousand evenings like this one, and will see a thousand more.",
      },
      {
        title: "INTO THE\nWHITE",
        src:   "images/fourfog.jpeg",
        date:  "2024",
        cat:   "Landscape",
        loc:   "Belgium",
        ar:    0.75,
        desc:  "Four figures walk into a morning that has erased the horizon. The frost keeps their footsteps, the fog swallows the rest — a quiet reminder of how small we are, and how we keep moving forward anyway, into whatever we cannot yet see.",
      },
      {
        title: "UNDER\nGLASS",
        src:   "images/greenhouse.jpeg",
        date:  "2024",
        cat:   "Botanical",
        loc:   "Meise, BE",
        ar:    0.81,
        desc:  "Giant waterlilies float beneath a cathedral of glass, an engineered tropics holding summer captive through the grey months. There is something tender in it — the lengths we go to keep a little wildness alive, and close, and ours.",
      },
      {
        title: "HARVEST\nLIGHT",
        src:   "images/wheatfield.jpeg",
        date:  "2023",
        cat:   "Landscape",
        loc:   "Belgium",
        ar:    1.57,
        desc:  "A single ear of wheat stands sharp against a dissolving sun while the field behind it softens into dusk. Summer at its tipping point — the brief moment of ripeness just before everything turns to gold and is gathered in.",
      },

    ],
  },

};
