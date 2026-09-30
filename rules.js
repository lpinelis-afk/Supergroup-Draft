/* ==========================================================================
   rules.js  --  SCORING RULES FOR "CHEMISTRY"
   ==========================================================================
   Two kinds of chemistry adjust your score when you draft a musician:

   1. CLASH_RULES         -- based on band VIBES (set in bands.js).
                             Drafting a member from a "mellow" band when you
                             already have someone from an "aggressive" band
                             costs points.

   2. RELATIONSHIP_RULES  -- based on SPECIFIC PEOPLE. Real-life bandmates and
                             friends earn bonus points; known feuds cost points.

   Both are checked against EVERYONE already in your lineup each time you
   make a pick, so a single pick can trigger several entries.
   ========================================================================== */


/* --------------------------------------------------------------------------
   CLASH_RULES: vibe pairs that don't belong on the same stage.
   - pair:    two vibes from VIBES (order doesn't matter)
   - penalty: points lost (negative number)
   - reason:  text shown in the Chemistry log
   Pairs not listed here (e.g. alt + aggressive) are fine: no penalty.
   -------------------------------------------------------------------------- */
const CLASH_RULES = [
  {pair:["mellow","aggressive"], penalty:-50, reason:"Whisper-quiet introspection standing next to a wall of blast beats."},
  {pair:["mellow","theatrical"], penalty:-40, reason:"Unplugged, candlelit energy just met pyrotechnics and fake blood."},
  {pair:["mellow","chaotic"], penalty:-30, reason:"Gentle and unhurried, meet gleeful pandemonium."},
  {pair:["theatrical","punk"], penalty:-25, reason:"Arena-scale spectacle crashing into a three-chord basement show."},
  {pair:["classic","chaotic"], penalty:-20, reason:"The elder statesmen did not sign up for this much anarchy."},
  {pair:["classic","punk"], penalty:-15, reason:"Stadium veterans sharing a stage with a band that plays for 90 seconds."}
];


/* --------------------------------------------------------------------------
   RELATIONSHIP_RULES: specific real-world relationships between musicians.
   - a, b:    exact member names, spelled the same as in bands.js
              (order doesn't matter)
   - type:    "friend" (shows a handshake icon) or "feud" (shows a lightning icon)
   - points:  positive for friends, negative for feuds
   - reason:  text shown in the Chemistry log
   These stack on top of the vibe clashes above.
   -------------------------------------------------------------------------- */
const RELATIONSHIP_RULES = [
  {a:"Dave Grohl", b:"Krist Novoselic", type:"friend", points:40, reason:"Nirvana's rhythm section, reunited."},
  {a:"Dave Grohl", b:"Josh Homme", type:"friend", points:40, reason:"Them Crooked Vultures bandmates and longtime friends."},
  {a:"Josh Homme", b:"Nick Oliveri", type:"friend", points:40, reason:"Kyuss and Queens of the Stone Age alumni."},
  {a:"Josh Homme", b:"John Garcia", type:"friend", points:35, reason:"Original Kyuss bandmates."},
  {a:"Josh Homme", b:"Mark Lanegan", type:"friend", points:35, reason:"Longtime collaborators and close friends."},
  {a:"Chris Cornell", b:"Eddie Vedder", type:"friend", points:35, reason:"Temple of the Dog bandmates."},
  {a:"Tom Morello", b:"Chris Cornell", type:"friend", points:35, reason:"Audioslave bandmates."},
  {a:"Axl Rose", b:"Slash", type:"feud", points:-50, reason:"Decades of very public bad blood."},
  {a:"Roger Waters", b:"David Gilmour", type:"feud", points:-45, reason:"Pink Floyd's most famous ongoing feud."},
  {a:"Joey Ramone", b:"Johnny Ramone", type:"feud", points:-45, reason:"Famously despised each other despite decades as bandmates."}
];
