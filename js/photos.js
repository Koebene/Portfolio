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
        desc:  "Before the words arrive,\nthe weather does.\n\nA brow gathers like cloud over water;\nsomething in her is raining\nthat has no name yet.\n\nOne day she will know what to call it.\nWill it ever again\nbe felt this whole?",
      },
      {
        title: "STILL\nWATERS",
        src:   "images/moulins.jpeg",
        date:  "2024",
        cat:   "Architecture",
        loc:   "Ruisbroek, BE",
        ar:    0.97,
        desc:  "The mill no longer grinds.\nIt stands, and is doubled.\n\nA century of grain passed through here\nand the water kept none of it —\nonly the shape, upside down,\nwithout weight.\n\nWhat is left of a life's work\nwhen the work is over?\nPerhaps this:\na likeness that asks for nothing.",
      },
      {
        title: "CHAPEL IN\nTHE MIST",
        src:   "images/chapel.jpeg",
        date:  "2024",
        cat:   "Landscape",
        loc:   "Belgium",
        ar:    0.78,
        desc:  "The forest is forgetting its edges.\nOnly the chapel keeps its outline,\npale as a held breath.\n\nSomeone carried these stones here.\nSomeone climbed these steps\nwith a question too heavy for home.\n\nThe fog does not answer.\nIt never has.\nAnd still, the door is there.",
      },
      {
        title: "MIRROR\nWORLD",
        src:   "images/mirrortree.jpeg",
        date:  "2024",
        cat:   "Abstract",
        loc:   "Belgium",
        ar:    0.63,
        desc:  "Here the tree grows downward\ninto a sky made of water,\nand for a moment you believe it.\n\nOnly the fallen leaves give it away,\nadrift on the surface of the dream.\n\nHow much of what we see is reflection —\nand how would we ever know,\nif nothing came floating by?",
      },
      {
        title: "CITY\nLINES",
        src:   "images/blurrycitylines.jpeg",
        date:  "2024",
        cat:   "Street",
        loc:   "Ghent, BE",
        ar:    1.78,
        desc:  "Wires above, rails below —\nthe city, drawn in lines\nthat all lead to the same old tower.\n\nBetween them strangers cross,\neach the centre of a world\nthe others walk straight through.\n\nA thousand journeys\nover the same worn stones,\nand not one of them repeated.",
      },
      {
        title: "FIRST\nSLEEP",
        src:   "images/baby.jpeg",
        date:  "2025",
        cat:   "Family",
        loc:   "Home",
        ar:    1.0,
        desc:  "So new\nthe world has asked for nothing yet.\n\nWrapped, watched over from every side,\nbreathing the slow tide of first days.\n\nWe spend the rest of our lives\nlooking for the way back\nto a trust this complete.\n\nSome of us call it home.",
      },
      {
        title: "LOW\nTIDE",
        src:   "images/jettyboat.jpeg",
        date:  "2024",
        cat:   "Landscape",
        loc:   "Wadden Sea, NL",
        ar:    0.58,
        desc:  "Down at the level of the planks\neverything leans toward the boat —\nrope, shadow, the grain of the wood.\n\nThe boat waits.\nThe jetty waits.\nThe sea comes back when it comes back.\n\nThere is a kind of faith\nin things that are made to wait:\nthey never ask how long.",
      },
      {
        title: "HOUSE\nLIGHTS",
        src:   "images/cafe.jpeg",
        date:  "2024",
        cat:   "Documentary",
        loc:   "Ghent, BE",
        ar:    1.33,
        desc:  "Under the chandeliers,\na hundred conversations\nand not one of them about you.\n\nThere is a mercy in that —\nto sit alone among others,\nheld by the murmur like warm water,\nunseen, and not lonely.\n\nEvery city needs one room\nwhere no one is expected\nand everyone belongs.",
      },
      {
        title: "LAST\nTRAIN",
        src:   "images/station.jpeg",
        date:  "2024",
        cat:   "Night",
        loc:   "Belgium",
        ar:    0.85,
        desc:  "The stairs go down into a pool of light\nand nobody goes with them.\n\nPlatforms one and two,\nthe cold, the hum of the lamps —\na place built for leaving,\nleft.\n\nWho was the last to stand here tonight,\nand did they get\nwhere they were going?",
      },
      {
        title: "SHOES IN\nTHE SKY",
        src:   "images/festival.jpeg",
        date:  "2023",
        cat:   "Festival",
        loc:   "Belgium",
        ar:    1.33,
        desc:  "Hundreds of pairs hang above the crowd,\nlaced to the sky\nby people who walked home barefoot.\n\nEach one a dare, a summer,\na night someone decided\nto leave a piece of themselves behind\nand keep on dancing.\n\nWhat would you throw up there\nto prove that you were here?",
      },
      {
        title: "TWO\nCHAIRS",
        src:   "images/twochairs.jpeg",
        date:  "2026",
        cat:   "Still Life",
        loc:   "Ardèche, FR",
        ar:    1.39,
        desc:  "Two chairs beneath the olive tree,\nturned a little toward each other,\nas if the talk had only paused.\n\nNo one is here.\nStill, the shade remembers\nthe weight of an afternoon,\nthe laughter gone up into the leaves.\n\nAn empty chair is never empty.\nIt keeps the shape\nof whoever it is waiting for.",
      },
      {
        title: "ALL NEW\nSOUNDS",
        src:   "images/visions.jpeg",
        date:  "2026",
        cat:   "Street",
        loc:   "Ardèche, FR",
        ar:    0.66,
        desc:  "A stranger walks away from me\nwith a promise on his back:\nall new sounds.\n\nThe wall behind him burns to white.\nThe street hears nothing new at all.\n\nMaybe that's how it is with promises —\nwe carry them out into the light,\nwhere everyone can read them\nbut us.",
      },
      {
        title: "LOOK\nUP",
        src:   "images/lookup.jpeg",
        date:  "31 Oct 2026",
        cat:   "Family",
        loc:   "Nieuwpoort, BE",
        ar:    0.66,
        desc:  "One arm straight up,\nmouth open on a word not finished,\nthe small body leaning after a finger.\n\nThere — look —\na gull, a cormorant, a cloud with a face;\nit hardly matters what.\n\nChildren don't keep wonder to themselves.\nWhen did we learn to?",
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
        desc:  "One figure at the edge of the stone,\nand all that sky.\n\nHere the mind goes where eyes can't —\nout past the horizon,\nand comes back carrying nothing,\nlighter for it.\n\nWe climb this high\nto feel how small we are.\nWhy is that such a relief?",
      },
      {
        title: "HIDDEN\nCOVE",
        src:   "images/boatescape.jpeg",
        date:  "2024",
        cat:   "Landscape",
        loc:   "Costa Brava, ES",
        ar:    1.0,
        desc:  "In the cove the sea forgets to move.\nOne boat, anchored in a blue\nthat seems to have been invented here.\n\nPine above, pale stone below,\nthe water so clear\nthe hull seems to rest on light.\n\nCut the engine.\nSome places only open\nto those who stop.",
      },
      {
        title: "AGAINST\nTHE WIND",
        src:   "images/vlieger.jpeg",
        date:  "2024",
        cat:   "Family",
        loc:   "Zeeland, NL",
        ar:    0.71,
        desc:  "A small hand, a length of string,\nand a whole sky pulling the other way.\n\nThis is how it begins:\nthe first negotiation\nwith something larger than yourself.\n\nHold too tight and it falls.\nLet go and it is gone.\nSomewhere between the two,\nit flies.",
      },
      {
        title: "THE\nCROSSING",
        src:   "images/ropey.jpeg",
        date:  "2024",
        cat:   "Travel",
        loc:   "Wadden Sea, NL",
        ar:    0.56,
        desc:  "Plank after plank,\nthe rope worn soft by every hand\nthat steadied itself here,\nand at the end, open water.\n\nEvery pier is a sentence\nthat stops before it is finished,\nleaving the last word to the sea.\n\nHow far would you walk\non something built\nonly to bring you to the edge?",
      },
      {
        title: "FADED\nGRANDEUR",
        src:   "images/chateau.jpeg",
        date:  "2023",
        cat:   "Architecture",
        loc:   "Belgium",
        ar:    1.52,
        desc:  "The turrets still hold their pose,\ndoubled in the dark water,\nthe reeds closing in like slow applause.\n\nAutumn takes everything gently —\ncolour first, then certainty.\n\nGrandeur was only ever borrowed,\nand time\nis a patient lender.",
      },
      {
        title: "UNDER\nTHE ARCHES",
        src:   "images/lisbon.jpeg",
        date:  "2023",
        cat:   "Travel",
        loc:   "Lisbon, PT",
        ar:    0.64,
        desc:  "Arch after arch after arch,\nthe same shape repeating like a held note,\nand at the end of it, light.\n\nOne figure walks the length of it,\nsmall inside the rhythm,\nkeeping time without knowing.\n\nDo we move through the corridor —\nor is it moving through us?",
      },
      {
        title: "BASS IN\nTHE PINES",
        src:   "images/soundsystem.jpeg",
        date:  "2023",
        cat:   "Festival",
        loc:   "Belgium",
        ar:    0.56,
        desc:  "A wall of speakers under the pines,\nthe bass rearranging the air.\n\nSkin, heat, dust —\nthe trees stand very still\nwhile everything else moves.\n\nFor a few hours, no one is a stranger.\nIs that what the old rituals were for:\na rhythm loud enough\nto quiet the self?",
      },
      {
        title: "HOME\nCOURT",
        src:   "images/basketcourt.jpeg",
        date:  "2023",
        cat:   "Travel",
        loc:   "Belgian Coast",
        ar:    0.75,
        desc:  "Two hoops face each other on the sand —\nno ball, no players, no score.\n\nThe day burns out over the sea\nas it has a thousand times before,\nas it will a thousand more.\n\nWho won the last game here?\nThe tide took the answer\nand left the evening in its place.",
      },
      {
        title: "INTO THE\nWHITE",
        src:   "images/fourfog.jpeg",
        date:  "2024",
        cat:   "Landscape",
        loc:   "Belgium",
        ar:    0.75,
        desc:  "Four figures walk into a morning\nthat has erased the horizon.\n\nThe frost keeps their footprints.\nThe fog keeps everything else.\n\nWe never see where the path goes,\nonly the next step —\nand somehow, together,\nthat has always been enough.",
      },
      {
        title: "UNDER\nGLASS",
        src:   "images/greenhouse.jpeg",
        date:  "2024",
        cat:   "Botanical",
        loc:   "Meise, BE",
        ar:    0.81,
        desc:  "Under a cathedral of glass\nthe lilies open their great green hands\nand hold up a summer\nthat isn't due for months.\n\nWe build whole climates\nto keep a little wildness close.\n\nIs this tenderness, or a cage?\nAsk the lilies.\nThey seem to have made their peace.",
      },
      {
        title: "HARVEST\nLIGHT",
        src:   "images/wheatfield.jpeg",
        date:  "2023",
        cat:   "Landscape",
        loc:   "Belgium",
        ar:    1.57,
        desc:  "One ear of wheat stands sharp\nagainst a sun already letting go.\n\nBehind it the whole field softens\ninto the colour of endings.\n\nRipeness is a moment, not a place.\nBy the time you notice it,\nit is already being gathered.",
      },
      {
        title: "THE LONG\nFURROW",
        src:   "images/furrows.jpeg",
        date:  "2026",
        cat:   "Landscape",
        loc:   "Ardèche, FR",
        ar:    1.61,
        desc:  "The harvest is in.\nOne furrow runs straight to the hills\nlike a thought followed to its end.\n\nThe stubble holds the last of the light.\nThe land exhales.\n\nRest is not the opposite of work.\nIt is the field remembering\nwhat it is for.",
      },
      {
        title: "THE GREEN\nCLOAK",
        src:   "images/ivytrunk.jpeg",
        date:  "2026",
        cat:   "Botanical",
        loc:   "Ardèche, FR",
        ar:    0.66,
        desc:  "Leaf over leaf, year over year,\nthe ivy writes itself across the bark\nuntil the tree is mostly rumour.\n\nNothing here is in a hurry,\nand nothing here is lost —\nonly turning into ground\nfor the next living thing.\n\nIs that an ending,\nor the oldest kind of generosity?",
      },
      {
        title: "MOSS AND\nSTONE",
        src:   "images/mossystream.jpeg",
        date:  "2026",
        cat:   "Landscape",
        loc:   "Ardèche, FR",
        ar:    1.50,
        desc:  "Every boulder wears a coat of moss\nso thick you forget it is stone.\n\nThe water argues with none of them.\nIt finds the gaps,\nthe light finds the water,\nand the whole ravine hums.\n\nSoftness, given time,\noutlasts what is hard.\nThe river has always known.",
      },
      {
        title: "THE\nVISITOR",
        src:   "images/sunflower.jpeg",
        date:  "2026",
        cat:   "Nature",
        loc:   "Ardèche, FR",
        ar:    1.50,
        desc:  "Up close the flower stops being a flower\nand becomes a world —\na thousand spirals turning inward\nunder a hard blue sky.\n\nSomewhere in the middle, a bee,\nindifferent to the mathematics,\nfollowing only the sweetness.\n\nPerhaps that is the wiser way:\nnot to understand the pattern,\nonly to find what feeds you in it.",
      },
      {
        title: "SEA\nLEVEL",
        src:   "images/pier.jpeg",
        date:  "31 Oct 2026",
        cat:   "Seascape",
        loc:   "Nieuwpoort, BE",
        ar:    1.50,
        desc:  "A pier ruled straight across the world,\nthe sea below, the sky above,\nin almost the same blue.\n\nNumbered posts. A red lifebuoy. One lamp.\nOrder, the way we like it.\n\nThen a cormorant crosses\non business of its own,\nand the whole picture remembers\nit is alive.",
      },
      {
        title: "FAIR\nWIND",
        src:   "images/lighthouse.jpeg",
        date:  "31 Oct 2026",
        cat:   "Seascape",
        loc:   "Nieuwpoort, BE",
        ar:    1.58,
        desc:  "At the pier's end a small lighthouse\nkeeps its one promise to the sea.\n\nA sailboat comes in under a single sail,\na flag at the stern,\nfaces turned to the sun.\n\nOne thing made to stay,\none thing made to leave —\neach of them, somehow,\nthe reason for the other.",
      },

    ],
  },

};
