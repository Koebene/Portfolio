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
        desc:  "You don't have the words yet.\nYou don't need them.\n\nThe storm is in your brow,\nthe rain behind your eyes,\nand you let it come\nthe way the sky does,\nwithout apology.\n\nOne day the world will teach you\nto explain what you feel.\nI hope you never learn\nto feel it any less.",
      },
      {
        title: "STILL\nWATERS",
        src:   "images/moulins.jpeg",
        date:  "2024",
        cat:   "Architecture",
        loc:   "Ruisbroek, BE",
        ar:    0.97,
        desc:  "The mill gave everything it had —\na hundred years of grain,\nof turning, of work.\n\nNow it rests,\nand the water holds it\nthe way you hold someone\nwho has nothing left to prove.\n\nMaybe that's all any of us want:\nto be held\nfor simply being here.",
      },
      {
        title: "CHAPEL IN\nTHE MIST",
        src:   "images/chapel.jpeg",
        date:  "2024",
        cat:   "Landscape",
        loc:   "Belgium",
        ar:    0.78,
        desc:  "The forest is letting go of its edges.\nOnly the chapel stays.\n\nSomeone built this\nwith their hands and their hope,\nfor the days the path disappears\nand you walk it anyway.\n\nYou don't have to see the way\nto believe in it.\nYou only need\none small light\nthat waits.",
      },
      {
        title: "MIRROR\nWORLD",
        src:   "images/mirrortree.jpeg",
        date:  "2024",
        cat:   "Abstract",
        loc:   "Belgium",
        ar:    0.63,
        desc:  "Sometimes the world turns upside down\nand looks more beautiful that way.\n\nThe tree reaches down,\nthe sky lies in the water,\nand only a few fallen leaves\nremind you what is real.\n\nNot everything upside down\nis broken.\nSome things are only\nshowing you their other side.",
      },
      {
        title: "CITY\nLINES",
        src:   "images/blurrycitylines.jpeg",
        date:  "2024",
        cat:   "Street",
        loc:   "Ghent, BE",
        ar:    1.78,
        desc:  "Wires above, rails below,\neveryone going somewhere.\n\nEvery stranger you pass\nis the centre of a world\nyou will never see.\n\nWalk gently.\nSo are you.",
      },
      {
        title: "FIRST\nSLEEP",
        src:   "images/baby.jpeg",
        date:  "2025",
        cat:   "Family",
        loc:   "Home",
        ar:    1.0,
        desc:  "You only just arrived\nand already you trust us\nwith everything.\n\nWrapped, watched over,\nyou sleep the way\nonly the very new can,\nas if the world were soft.\n\nLittle one,\nI will spend my life\ntrying to keep it that way.",
      },
      {
        title: "LOW\nTIDE",
        src:   "images/jettyboat.jpeg",
        date:  "2024",
        cat:   "Landscape",
        loc:   "Wadden Sea, NL",
        ar:    0.58,
        desc:  "The boat waits.\nThe rope waits.\nThe whole jetty leans\ntoward a sea that has gone away.\n\nIt will come back.\nIt always comes back.\n\nSome things aren't lost,\nonly further away for a while.\nBe patient with them.\nBe patient with yourself.",
      },
      {
        title: "HOUSE\nLIGHTS",
        src:   "images/cafe.jpeg",
        date:  "2024",
        cat:   "Documentary",
        loc:   "Ghent, BE",
        ar:    1.33,
        desc:  "Under the chandeliers,\na hundred conversations,\nand not one of them about you.\n\nWhat a relief.\n\nSit down.\nOrder something warm.\nLet the noise hold you\nlike a coat on a cold day.\n\nYou don't always need to be seen.\nSometimes you only need\nto belong somewhere.",
      },
      {
        title: "LAST\nTRAIN",
        src:   "images/station.jpeg",
        date:  "2024",
        cat:   "Night",
        loc:   "Belgium",
        ar:    0.85,
        desc:  "The stairs go down into the light,\nand no one goes with them.\n\nThe last train has left.\nThe platform doesn't mind.\nIt has learned that everyone leaves\nand something always arrives.\n\nIf you missed yours tonight,\nstay a moment.\nThe light is still on.",
      },
      {
        title: "SHOES IN\nTHE SKY",
        src:   "images/festival.jpeg",
        date:  "2023",
        cat:   "Festival",
        loc:   "Belgium",
        ar:    1.33,
        desc:  "Hundreds of shoes in the sky,\nthrown up by people\nwho danced until their feet gave out\nand walked home barefoot,\nhappy.\n\nMaybe that's the whole secret:\nleave a little of yourself\neverywhere you were truly alive.\n\nWhat would you throw up there?",
      },
      {
        title: "TWO\nCHAIRS",
        src:   "images/twochairs.jpeg",
        date:  "2026",
        cat:   "Still Life",
        loc:   "Ardèche, FR",
        ar:    1.39,
        desc:  "Two chairs under an old olive tree,\nturned a little toward each other.\n\nNobody is sitting there now.\nBut you can tell\nsomeone was loved here,\nthe way you can tell\na book has been read.\n\nSome places keep our conversations\nlong after we've gone home.",
      },
      {
        title: "ALL NEW\nSOUNDS",
        src:   "images/visions.jpeg",
        date:  "2026",
        cat:   "Street",
        loc:   "Ardèche, FR",
        ar:    0.66,
        desc:  "He walks away from me\nwith a promise on his back:\nall new sounds.\n\nHe will never read it himself.\nThat's how it goes\nwith the best things about us —\n\neveryone can see them\nbut us.",
      },
      {
        title: "LOOK\nUP",
        src:   "images/lookup.jpeg",
        date:  "2026",
        cat:   "Family",
        loc:   "Belgian Coast",
        ar:    0.66,
        desc:  "One small arm, straight up.\nLook — there!\n\nA bird, a cloud,\na whole sky full of something.\nIt doesn't matter what.\nWhat matters is the pointing,\nthe need to share it.\n\nChildren don't keep wonder\nto themselves.\nWhen did we start to?",
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
        desc:  "Sometimes you have to climb\nall the way up here\nto remember how small you are.\n\nAnd how free that is.\n\nAll those worries,\nand the sky\ndoesn't know a single one.\n\nBreathe.\nYou can put them down now.",
      },
      {
        title: "HIDDEN\nCOVE",
        src:   "images/boatescape.jpeg",
        date:  "2024",
        cat:   "Landscape",
        loc:   "Costa Brava, ES",
        ar:    1.0,
        desc:  "There are places\nthe world hasn't found yet.\n\nA boat, a blue\nyou could fall into,\npine and pale stone\nkeeping the secret.\n\nFind yours.\nTurn off the engine,\nturn off the noise,\nand let the stillness\nfind you.",
      },
      {
        title: "AGAINST\nTHE WIND",
        src:   "images/vlieger.jpeg",
        date:  "2024",
        cat:   "Family",
        loc:   "Zeeland, NL",
        ar:    0.71,
        desc:  "A small hand, a length of string,\nand a whole sky\npulling the other way.\n\nHold on too tight\nand it falls.\nLet go completely\nand it's gone.\n\nLove is like that, I think.\nIt flies\nsomewhere in between.",
      },
      {
        title: "THE\nCROSSING",
        src:   "images/ropey.jpeg",
        date:  "2024",
        cat:   "Travel",
        loc:   "Wadden Sea, NL",
        ar:    0.56,
        desc:  "Plank after plank,\nthe rope worn soft\nby every hand that held on here.\n\nYou don't have to see the whole sea\nto take the next step.\n\nYou only have to trust\nthe wood beneath your feet,\nand the ones\nwho walked it first.",
      },
      {
        title: "FADED\nGRANDEUR",
        src:   "images/chateau.jpeg",
        date:  "2023",
        cat:   "Architecture",
        loc:   "Belgium",
        ar:    1.52,
        desc:  "The château stands in its reflection\nlike someone who was once adored\nand still dresses for it.\n\nAutumn takes the colour\ngently, the way time does.\n\nHere is what I know:\nbeauty doesn't leave.\nIt only changes\nthe way it speaks.",
      },
      {
        title: "UNDER\nTHE ARCHES",
        src:   "images/lisbon.jpeg",
        date:  "2023",
        cat:   "Travel",
        loc:   "Lisbon, PT",
        ar:    0.64,
        desc:  "Arch after arch after arch,\nand at the end of it, light.\n\nYou can't see it yet\nfrom where you're standing.\nThat's all right.\nKeep walking.\n\nThe long way through\nis still a way through.",
      },
      {
        title: "BASS IN\nTHE PINES",
        src:   "images/soundsystem.jpeg",
        date:  "2023",
        cat:   "Festival",
        loc:   "Belgium",
        ar:    0.56,
        desc:  "Bass in the pines,\nheat on the skin,\nstrangers moving\nlike old friends.\n\nFor one night\nnobody is lonely.\n\nMaybe we were never meant\nto carry ourselves alone.\nMaybe that's what music is for.",
      },
      {
        title: "HOME\nCOURT",
        src:   "images/basketcourt.jpeg",
        date:  "2023",
        cat:   "Travel",
        loc:   "Belgian Coast",
        ar:    0.75,
        desc:  "Two hoops on the sand,\nno ball, no players, no score.\n\nThe sun goes down\nlike it has a thousand times,\nand it's still worth stopping for.\n\nNot everything has to be won.\nSome evenings\nyou only have to\nbe there.",
      },
      {
        title: "INTO THE\nWHITE",
        src:   "images/fourfog.jpeg",
        date:  "2024",
        cat:   "Landscape",
        loc:   "Belgium",
        ar:    0.75,
        desc:  "Four figures walk into a morning\nthat has forgotten the horizon.\n\nNobody knows what's out there.\nNobody ever does.\n\nBut look how close they walk.\nMaybe that's the answer:\nnot knowing the way,\nbut knowing\nwho you walk it with.",
      },
      {
        title: "UNDER\nGLASS",
        src:   "images/greenhouse.jpeg",
        date:  "2024",
        cat:   "Botanical",
        loc:   "Meise, BE",
        ar:    0.81,
        desc:  "Under a sky of glass\nthe lilies open their great green hands\nand hold up a summer\nthat isn't even here yet.\n\nCarry your own warmth\nthrough the grey months.\n\nYou are allowed\nto bloom\nbefore the world is ready.",
      },
      {
        title: "HARVEST\nLIGHT",
        src:   "images/wheatfield.jpeg",
        date:  "2023",
        cat:   "Landscape",
        loc:   "Belgium",
        ar:    1.57,
        desc:  "One ear of wheat,\nstanding tall\nwhile the sun lets go.\n\nEverything ripens in its own time,\nnot one day sooner\nbecause you hurry it.\n\nBe gentle with your season.\nYou are not late.\nYou are still growing.",
      },
      {
        title: "THE LONG\nFURROW",
        src:   "images/furrows.jpeg",
        date:  "2026",
        cat:   "Landscape",
        loc:   "Ardèche, FR",
        ar:    1.61,
        desc:  "The harvest is in.\nThe field lies open,\none long furrow\nrunning all the way to the hills.\n\nIt gave everything this year.\nNow it rests,\nand no one calls it lazy.\n\nRest, when it's your turn.\nIt's how a field\ngets ready to give again.",
      },
      {
        title: "THE GREEN\nCLOAK",
        src:   "images/ivytrunk.jpeg",
        date:  "2026",
        cat:   "Botanical",
        loc:   "Ardèche, FR",
        ar:    0.66,
        desc:  "Leaf over leaf,\nyear over year,\nthe ivy wraps the old tree\nlike a promise kept slowly.\n\nNothing here is in a hurry.\nNothing here is lost.\n\nThis is what love looks like\nwhen it's given time:\nit stays,\nand it grows.",
      },
      {
        title: "MOSS AND\nSTONE",
        src:   "images/mossystream.jpeg",
        date:  "2026",
        cat:   "Landscape",
        loc:   "Ardèche, FR",
        ar:    1.50,
        desc:  "The water never fights the stone.\nIt just keeps moving,\nsoft and patient,\nfinding the gaps.\n\nAnd the stone,\ngiven enough years,\ngrows a coat of green\nand softens too.\n\nBe the water.\nSoftness wins\nin the end.",
      },
      {
        title: "THE\nVISITOR",
        src:   "images/sunflower.jpeg",
        date:  "2026",
        cat:   "Nature",
        loc:   "Ardèche, FR",
        ar:    1.50,
        desc:  "A thousand perfect spirals,\nand the bee doesn't care.\n\nIt doesn't need to understand\nthe mathematics of a flower.\nIt only knows\nwhere the sweetness is.\n\nYou don't have to understand\nall of it either.\nJust find what feeds your soul.",
      },
      {
        title: "SEA\nLEVEL",
        src:   "images/pier.jpeg",
        date:  "2026",
        cat:   "Seascape",
        loc:   "Belgian Coast",
        ar:    1.50,
        desc:  "A pier ruled straight across the sea.\nNumbered posts, a red lifebuoy,\none lamp.\n\nEverything in its place.\n\nAnd then a cormorant crosses,\non its way somewhere,\nasking no one's permission.\n\nOrder is beautiful.\nBut it's the one thing out of place\nthat makes it breathe.",
      },
      {
        title: "FAIR\nWIND",
        src:   "images/lighthouse.jpeg",
        date:  "2026",
        cat:   "Seascape",
        loc:   "Belgian Coast",
        ar:    1.58,
        desc:  "The lighthouse stays.\nThe boat comes home.\n\nOne made to wait,\none made to wander,\nand neither of them whole\nwithout the other.\n\nBe someone's lighthouse.\nAnd when you're lost at sea,\nlet someone be yours.",
      },

    ],
  },

};
