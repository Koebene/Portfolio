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
        desc:  "don't smile it away.\ni'm not being difficult,\ni'm being honest\nwith the only face i have.\n\nthe mud is from today.\nthe storm is from somewhere\ni don't have words for yet.\n\njust stay\nuntil it clears.",
      },
      {
        title: "STILL\nWATERS",
        src:   "images/moulins.jpeg",
        date:  "2024",
        cat:   "Architecture",
        loc:   "Ruisbroek, BE",
        ar:    0.97,
        desc:  "i used to grind wheat into bread.\nnow people live where the grain was,\nand the balconies face the water.\n\nnobody asked me\nif i wanted to change.\n\nturns out\nyou can still be a home\nlong after you stop being\nwhat they built you for.",
      },
      {
        title: "CHAPEL IN\nTHE MIST",
        src:   "images/chapel.jpeg",
        date:  "2024",
        cat:   "Landscape",
        loc:   "Belgium",
        ar:    0.78,
        desc:  "the fog has taken the forest,\nthe path, the far side of the water.\nit hasn't taken me.\n\ni'm not here for the clear days.\ni'm here for the ones\nwhen you can't see a thing\nand come anyway.",
      },
      {
        title: "MIRROR\nWORLD",
        src:   "images/mirrortree.jpeg",
        date:  "2024",
        cat:   "Abstract",
        loc:   "Belgium",
        ar:    0.63,
        desc:  "i'm the tree you see\nwhen you look down.\n\nsame branches, same leaves,\nonly upside down, and quieter.\n\nmost people never notice me\nuntil a leaf lands\nand makes me tremble.\n\nwe all have a version of ourselves\nthat only shows\nwhen everything goes still.",
      },
      {
        title: "CITY\nLINES",
        src:   "images/blurrycitylines.jpeg",
        date:  "2024",
        cat:   "Street",
        loc:   "Ghent, BE",
        ar:    1.78,
        desc:  "i'm made of lines —\nrails, wires, the routes you take\nwithout thinking.\n\nevery day you pass a hundred strangers\non my stones.\n\none of them\nis going to matter.\nyou just don't know\nwhich one yet.",
      },
      {
        title: "FIRST\nSLEEP",
        src:   "images/baby.jpeg",
        date:  "2025",
        cat:   "Family",
        loc:   "Home",
        ar:    1.0,
        desc:  "we hang above you like small moons,\na woolly lamb\nand soft things with no names yet.\n\nyou don't know what we are.\nyou don't need to.\n\njust know\nthat every time you open your eyes,\nsomething that loves you\nwill be looking back.",
      },
      {
        title: "LOW\nTIDE",
        src:   "images/jettyboat.jpeg",
        date:  "2024",
        cat:   "Landscape",
        loc:   "Wadden Sea, NL",
        ar:    0.58,
        desc:  "the water left,\nand i stayed exactly where it found me.\n\nthat's what i'm for:\nto hold still\nfor the things that drift.\n\nit always comes back.\nnot because i asked —\nbecause it knows\nwhere i am.",
      },
      {
        title: "HOUSE\nLIGHTS",
        src:   "images/cafe.jpeg",
        date:  "2024",
        cat:   "Documentary",
        loc:   "Ghent, BE",
        ar:    1.33,
        desc:  "i've heard every kind of conversation —\nfirst dates, last drinks,\nthe ones that end in silence.\n\ni never tell.\n\npull up a stool.\nyou don't have to talk.\nsome rooms are just\nfor not being alone.",
      },
      {
        title: "LAST\nTRAIN",
        src:   "images/station.jpeg",
        date:  "2024",
        cat:   "Night",
        loc:   "Belgium",
        ar:    0.85,
        desc:  "everyone who comes down these stairs\nis in a hurry to leave me.\n\ni don't mind.\ni was built for goodbyes.\n\nbut if you missed yours tonight,\nstand here a while.\nthe next one is always coming,\neven when it doesn't feel like it.",
      },
      {
        title: "SHOES IN\nTHE SKY",
        src:   "images/festival.jpeg",
        date:  "2023",
        cat:   "Festival",
        loc:   "Belgium",
        ar:    1.33,
        desc:  "we were thrown up here\nat the end of someone's best summer.\n\nwe'll never walk again.\nwe don't mind.\n\nwe got to see\nwhat joy looks like from above:\na crowd that forgot,\nfor one whole afternoon,\nto be careful.",
      },
      {
        title: "TWO\nCHAIRS",
        src:   "images/twochairs.jpeg",
        date:  "2026",
        cat:   "Still Life",
        loc:   "Ardèche, FR",
        ar:    1.39,
        desc:  "we've been facing each other\nall afternoon,\nwaiting for the two of you.\n\nwe don't need much.\na little shade,\na table small enough\nthat your knees touch.\n\ncome back before the light goes.\nwe'll keep your places.",
      },
      {
        title: "ALL NEW\nSOUNDS",
        src:   "images/visions.jpeg",
        date:  "2026",
        cat:   "Street",
        loc:   "Ardèche, FR",
        ar:    0.66,
        desc:  "you wear me on your back,\nso you're the only one\nwho can't read me.\n\nvisions of all new sounds —\nthe street sees it,\nthe light sees it.\n\nthe best things about you\nare often written\nwhere you can't see them.\nthat's what the people\nwalking behind you are for.",
      },
      {
        title: "LOOK\nUP",
        src:   "images/lookup.jpeg",
        date:  "31 Oct 2026",
        cat:   "Family",
        loc:   "Nieuwpoort, BE",
        ar:    0.66,
        desc:  "look — no, up, higher!\nthere, see it?\n\nyou keep looking at me.\ni keep pointing at the sky.\n\none day i'll stop\ntelling you everything i see.\nso please,\nwhile i still do,\nlook where i'm pointing.",
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
        desc:  "they climb me\nwhen the world gets too loud,\nstand on my back\nand let the sky do the talking.\n\ni don't say a word.\ni never have.\n\nmost of the time\nthat's exactly\nwhat they came for.",
      },
      {
        title: "HIDDEN\nCOVE",
        src:   "images/boatescape.jpeg",
        date:  "2024",
        cat:   "Landscape",
        loc:   "Costa Brava, ES",
        ar:    1.0,
        desc:  "i'm not on the way to anywhere.\nyou have to mean to find me.\n\none boat,\nwater so clear it hides nothing,\ncliffs that hide everything else.\n\nmaybe that's the trick:\nbe clear with the one who finds you,\nand quiet with the rest of the world.",
      },
      {
        title: "AGAINST\nTHE WIND",
        src:   "images/vlieger.jpeg",
        date:  "2024",
        cat:   "Family",
        loc:   "Zeeland, NL",
        ar:    0.71,
        desc:  "you think you're holding me.\nyou are.\n\nbut here's what you don't know yet:\ni only fly\nbecause you pull back.\n\nthe ones who love you\ndon't let you drift.\nthey hold on\njust enough\nfor you to rise.",
      },
      {
        title: "THE\nCROSSING",
        src:   "images/ropey.jpeg",
        date:  "2024",
        cat:   "Travel",
        loc:   "Wadden Sea, NL",
        ar:    0.56,
        desc:  "every hand that crossed here\nheld on to me a little.\n\nlook how soft i've worn.\nlook how i sag\nwhere they needed me most.\n\nthat isn't damage.\nthat's what being leaned on\nlooks like.",
      },
      {
        title: "FADED\nGRANDEUR",
        src:   "images/chateau.jpeg",
        date:  "2023",
        cat:   "Architecture",
        loc:   "Belgium",
        ar:    1.52,
        desc:  "every autumn the trees around me\ngive everything away\nand call it beautiful.\n\ni used to think\ngrandeur meant keeping.\n\nthen i watched them\nburn gold\non their way to letting go.",
      },
      {
        title: "UNDER\nTHE ARCHES",
        src:   "images/lisbon.jpeg",
        date:  "2023",
        cat:   "Travel",
        loc:   "Lisbon, PT",
        ar:    0.64,
        desc:  "i'm a hundred arches\nsaying the same thing over and over:\nkeep going.\n\nyou don't hear us.\nyou don't need to.\nyou're already walking toward the light\nlike you know something.\n\nmaybe that's what love is, too —\nthe same small shelter,\nrepeated,\nuntil you're through.",
      },
      {
        title: "BASS IN\nTHE PINES",
        src:   "images/soundsystem.jpeg",
        date:  "2023",
        cat:   "Festival",
        loc:   "Belgium",
        ar:    0.56,
        desc:  "i'm the loudest thing in this forest,\nand still the trees were here first.\n\ni don't ask anyone to dance.\ni just shake the air\nuntil the shy ones forget themselves.\n\nthat's all most of us need:\nsomething loud enough\nto drown out\nthe voice that says don't.",
      },
      {
        title: "HOME\nCOURT",
        src:   "images/basketcourt.jpeg",
        date:  "2023",
        cat:   "Travel",
        loc:   "Belgian Coast",
        ar:    0.75,
        desc:  "my net is torn,\nthe last game ended years ago,\nand every evening\nthe sky still shows up for me.\n\nnobody keeps score here anymore.\n\nmaybe that's when a place\nbecomes home:\nwhen it's loved\nfor no reason at all.",
      },
      {
        title: "INTO THE\nWHITE",
        src:   "images/fourfog.jpeg",
        date:  "2024",
        cat:   "Landscape",
        loc:   "Belgium",
        ar:    0.75,
        desc:  "i took the horizon from them,\nthe trees, the edges, the plan.\n\nthey kept walking anyway,\nclose enough to hear each other.\n\ni can hide where you're going.\ni can't hide\nwho you're going with.",
      },
      {
        title: "UNDER\nGLASS",
        src:   "images/greenhouse.jpeg",
        date:  "2024",
        cat:   "Botanical",
        loc:   "Meise, BE",
        ar:    0.81,
        desc:  "outside it's grey.\nin here, someone keeps it summer for me.\n\ni didn't choose this glass.\ni'm learning to love it anyway.\n\nsome of us bloom in the wild.\nsome of us bloom\nbecause somebody\nkept the heat on.",
      },
      {
        title: "HARVEST\nLIGHT",
        src:   "images/wheatfield.jpeg",
        date:  "2023",
        cat:   "Landscape",
        loc:   "Belgium",
        ar:    1.57,
        desc:  "the sun is going down\nand i'm still green.\n\neveryone around me\nis in a hurry to turn gold.\n\nnot me.\ni'll ripen when i'm ready.\nthe light comes back tomorrow,\nand so will i.",
      },
      {
        title: "THE LONG\nFURROW",
        src:   "images/furrows.jpeg",
        date:  "2026",
        cat:   "Landscape",
        loc:   "Ardèche, FR",
        ar:    1.61,
        desc:  "they took everything i grew this year.\ni let them.\ngiving was the whole idea.\n\nnow there's just one long line\nrunning to the hills,\nand quiet.\n\ndon't feel sorry for an empty field.\nit isn't over.\nit's resting\nwith its arms open.",
      },
      {
        title: "THE GREEN\nCLOAK",
        src:   "images/ivytrunk.jpeg",
        date:  "2026",
        cat:   "Botanical",
        loc:   "Ardèche, FR",
        ar:    0.66,
        desc:  "i didn't ask the tree for permission.\ni just held on,\nleaf by leaf,\nyear by year.\n\nit never pushed me away.\n\nthat's the kind of love i trust:\nnot a moment,\na slow green yes\nthat keeps on growing.",
      },
      {
        title: "MOSS AND\nSTONE",
        src:   "images/mossystream.jpeg",
        date:  "2026",
        cat:   "Landscape",
        loc:   "Ardèche, FR",
        ar:    1.50,
        desc:  "i was hard once.\nsharp at the edges,\ncold all the way through.\n\nthen the water kept passing,\nand the moss kept staying,\nand now\ni'm soft enough to rest on.\n\nit wasn't one thing that changed me.\nit was everything that stayed gentle.",
      },
      {
        title: "THE\nVISITOR",
        src:   "images/sunflower.jpeg",
        date:  "2026",
        cat:   "Nature",
        loc:   "Ardèche, FR",
        ar:    1.50,
        desc:  "i spent all summer\nturning toward the sun,\nbuilding a thousand perfect spirals.\n\nyou don't care about any of it.\nyou just land\nright in the middle of me\nand take what's sweet.\n\nhonestly,\nthat's the kindest thing\nanyone's done for me all year.",
      },
      {
        title: "SEA\nLEVEL",
        src:   "images/pier.jpeg",
        date:  "31 Oct 2026",
        cat:   "Seascape",
        loc:   "Nieuwpoort, BE",
        ar:    1.50,
        desc:  "the pier keeps its line,\npost after numbered post,\none lifebuoy, one lamp.\n\ni don't.\ni cross wherever the wind lets me.\n\nyou can respect a straight line\nand still\nnot walk it.",
      },
      {
        title: "FAIR\nWIND",
        src:   "images/lighthouse.jpeg",
        date:  "31 Oct 2026",
        cat:   "Seascape",
        loc:   "Nieuwpoort, BE",
        ar:    1.58,
        desc:  "i don't chase the boats.\ni never have.\n\ni just stay lit\nat the end of the pier,\nso whoever's out there\nknows the way back.\n\nsome love sails.\nsome love waits with the light on.\nboth of them\nbring you home.",
      },

    ],
  },

};
