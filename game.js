/* ==========================================================================
   game.js  --  GAME LOGIC + RENDERING
   ==========================================================================
   Depends on two files that must be loaded BEFORE this one (see index.html):
     bands.js  ->  BANDS, VIBES
     rules.js  ->  CLASH_RULES, RELATIONSHIP_RULES

   HOW THE GAME WORKS
   1. A random band appears on stage.
   2. You click one member. They are auto-assigned to the first open slot that
      matches their instrument(s) (e.g. "Vocals/Guitar" tries Lead Vocals,
      then Lead Guitar, then Wildcard).
   3. You earn "fit" points depending on how far down their instrument list
      the slot was (main instrument = 100, second = 35, Wildcard = -15).
   4. "Chemistry" points are added/subtracted based on who is already in your
      lineup (vibe clashes and real-life friendships/feuds).
   5. Fill all 7 slots to see your final grade.

   FILE LAYOUT (top to bottom)
     A. Settings            D. Scoring helpers        G. Drawing a band
     B. Setup + validation  E. Game state             H. Rendering screens
     C. Slot matching       F. Small render helpers   I. Start the game
   ========================================================================== */


/* ==========================================================================
   A. SETTINGS -- tweak these numbers to change the game's balance
   ========================================================================== */

// The seven lineup slots, in the order they're displayed.
const SLOTS = ["Lead Vocals", "Lead Guitar", "Bass", "Drums", "Keyboards", "Violin/Accordion", "Wildcard"];

// Points awarded for how well a member fits the slot they land in.
// Index 0 = the slot matches their FIRST listed instrument, 1 = their second,
// and anything further down (including the automatic Wildcard fallback) uses
// the last entry.
const FIT_TIERS = [
  {label:"Perfect Fit",    cls:"perfect",  points:100},
  {label:"Stretch Pick",   cls:"stretch",  points:35},
  {label:"Total Wildcard", cls:"wildcard", points:-15}
];

// Rerolls: swapping the band on stage costs points, limited per round.
const MAX_REROLLS = 3;
const REROLL_PENALTY = -15;

// Final grade thresholds, highest first. The first one the score reaches wins.
const GRADES = [
  {min:630, label:"S-Tier Supergroup"},
  {min:490, label:"Arena Headliner"},
  {min:350, label:"Solid Bar Gig"},
  {min:210, label:"Garage Band Energy"},
  {min:-Infinity, label:"Beautiful Disaster"}
];


/* ==========================================================================
   B. SETUP + VALIDATION
   ========================================================================== */

// Lookup table { "Band Name": "vibe" } built from the BANDS list, so each
// band's vibe only has to be written once, in bands.js.
const BAND_VIBES = Object.fromEntries(BANDS.map(b => [b.name, b.vibe]));

// Friendly safety net for when you add bands: problems are reported in the
// browser console (press F12) instead of silently breaking the game.
function validateBands(){
  const seen = new Set();
  BANDS.forEach(b => {
    if(seen.has(b.name)) console.warn(`[bands.js] Duplicate band name: "${b.name}"`);
    seen.add(b.name);
    if(!b.vibe) console.warn(`[bands.js] "${b.name}" has no vibe, so it will never cause or avoid clashes.`);
    else if(!VIBES.includes(b.vibe)) console.warn(`[bands.js] "${b.name}" has unknown vibe "${b.vibe}". Allowed: ${VIBES.join(", ")}`);
    if(!Array.isArray(b.members) || b.members.length === 0) console.warn(`[bands.js] "${b.name}" has no members.`);
  });
}
validateBands();

// Randomly reorders a COPY of an array (Fisher-Yates shuffle).
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}


/* ==========================================================================
   C. SLOT MATCHING -- which slot does a musician end up in?
   ========================================================================== */

// Turns an instrument string like "Vocals/Guitar" into an ordered list of
// slots to try: ["Lead Vocals", "Lead Guitar", "Wildcard"].
// "Wildcard" is always added as the final fallback.
function candidateSlots(instr){
  const tags = instr.split('/').map(t => t.trim());
  const mapped = [];
  tags.forEach(tag => {
    const low = tag.toLowerCase();
    let slot;
    if(low.includes('vocal')) slot = 'Lead Vocals';
    else if(low.includes('guitar')) slot = 'Lead Guitar';
    else if(low.includes('bass')) slot = 'Bass';
    else if(low.includes('drum')) slot = 'Drums';
    else if(low.includes('key')) slot = 'Keyboards';
    else if(low.includes('violin') || low.includes('viola') || low.includes('accordion')) slot = 'Violin/Accordion';
    else slot = 'Wildcard'; // trumpet, sax, percussion, etc.
    if(!mapped.includes(slot)) mapped.push(slot);
  });
  if(!mapped.includes('Wildcard')) mapped.push('Wildcard');
  return mapped;
}

// Picks the fit tier for the i-th candidate slot (see FIT_TIERS above).
function fitForIndex(i){
  return FIT_TIERS[Math.min(i, FIT_TIERS.length - 1)];
}

// Finds the first OPEN slot for a member and how well it fits them.
// Returns {slot, fit}, or null if every slot they could fill is taken.
function findAssignment(instr){
  const candidates = candidateSlots(instr);
  for(let i=0;i<candidates.length;i++){
    if(!picks[candidates[i]]){
      return {slot: candidates[i], fit: fitForIndex(i)};
    }
  }
  return null;
}


/* ==========================================================================
   D. SCORING HELPERS
   ========================================================================== */

// Maps a final score to its grade title using the GRADES table.
function gradeForScore(total){
  return GRADES.find(g => total >= g.min).label;
}

// Looks up a clash rule for two vibes (either order). Returns null if none.
function clashRuleFor(vibeA, vibeB){
  return CLASH_RULES.find(r =>
    (r.pair[0] === vibeA && r.pair[1] === vibeB) ||
    (r.pair[0] === vibeB && r.pair[1] === vibeA)
  ) || null;
}

// Looks up a friendship/feud rule for two musicians (either order).
function relationshipRuleFor(nameA, nameB){
  return RELATIONSHIP_RULES.find(r =>
    (r.a === nameA && r.b === nameB) || (r.a === nameB && r.b === nameA)
  ) || null;
}

// Compares a newly-drafted member against everyone already in the lineup.
// Checks both vibe clashes AND specific friendships/feuds, and returns every
// match found (a single pick can trigger several, positive or negative).
function evaluatePick(newBandName, newMemberName){
  const found = [];
  const newVibe = BAND_VIBES[newBandName];
  SLOTS.forEach(slot => {
    const existing = picks[slot];
    if(!existing) return;

    // Vibe clash between the new member's band and the existing member's band.
    if(newVibe){
      const exVibe = BAND_VIBES[existing.band];
      if(exVibe){
        const rule = clashRuleFor(newVibe, exVibe);
        if(rule) found.push({withName: existing.name, reason: rule.reason, penalty: rule.penalty, type:"clash"});
      }
    }

    // Specific friendship or feud between these two people.
    const relRule = relationshipRuleFor(newMemberName, existing.name);
    if(relRule) found.push({withName: existing.name, reason: relRule.reason, penalty: relRule.points, type: relRule.type});
  });
  return found;
}


/* ==========================================================================
   E. GAME STATE -- everything that changes while you play
   ========================================================================== */

let deck = shuffle(BANDS);      // shuffled copy of all bands
let usedBandNames = new Set();  // bands already shown this game
let picks = {};                 // slot name -> {name, instr, band, fitLabel, fitCls, fitPoints, notes}
let filledCount = 0;            // how many slots are filled
let currentBand = null;         // the band currently on stage
let lastFilledSlot = null;      // remembered so its ticket can be highlighted
let score = 0;                  // total = fitTotal + chemTotal + rerollTotal
let fitTotal = 0;               // points from instrument fit
let chemTotal = 0;              // points from chemistry (clashes, friends, feuds)
let rerollTotal = 0;            // points lost to rerolls
let rerollsUsed = 0;            // rerolls used in the CURRENT round
let clashLog = [];              // chemistry entries shown to the player: {a, b, reason, penalty, type}

// Resets everything for "Draft Again".
function resetGame(){
  deck = shuffle(BANDS);
  usedBandNames = new Set();
  picks = {};
  filledCount = 0;
  lastFilledSlot = null;
  score = 0;
  fitTotal = 0;
  chemTotal = 0;
  rerollTotal = 0;
  rerollsUsed = 0;
  clashLog = [];
}


/* ==========================================================================
   F. SMALL RENDER HELPERS
   ========================================================================== */

const setlistEl = document.getElementById('setlist');
const gameArea = document.getElementById('game-area');

// Builds the text like "135 fit, +40 chemistry, -15 rerolls".
// Zero-value parts (except fit) are left out to keep it short.
function breakdownText(){
  const parts = [`${fitTotal} fit`];
  if(chemTotal !== 0) parts.push(`${chemTotal > 0 ? '+' + chemTotal : chemTotal} chemistry`);
  if(rerollTotal !== 0) parts.push(`${rerollTotal} rerolls`);
  return parts.join(', ');
}

// Updates the score number + breakdown under the title.
function renderScorebar(){
  document.getElementById('score-value').textContent = score;
  const breakdown = document.getElementById('score-breakdown');
  if(breakdown) breakdown.textContent = breakdownText();
}

// HTML for one chemistry entry (friend = handshake, clash/feud = lightning).
function clashEntryHTML(c){
  const icon = c.type === "friend" ? "🤝" : "⚡";
  const sign = c.penalty > 0 ? "+" + c.penalty : c.penalty;
  const cls = c.penalty > 0 ? "positive" : "negative";
  return `<div class="clash-entry ${cls}"><span class="clash-names">${icon} ${c.a} × ${c.b}</span><span class="clash-penalty">${sign}</span><div class="clash-reason">${c.reason}</div></div>`;
}

// Shows the running Chemistry log under the setlist.
function renderClashLog(){
  const el = document.getElementById('clashlog');
  if(!el) return;
  if(clashLog.length === 0){ el.innerHTML = ''; return; }
  el.innerHTML = '<div class="clashlog-title">Chemistry</div>' + clashLog.map(clashEntryHTML).join('');
}

// Redraws the row of slot "tickets". Filled slots show the musician and a
// fit tag; empty slots are dimmed. The most recent pick gets a highlight.
function renderSetlist(){
  setlistEl.innerHTML = '';
  SLOTS.forEach(slot => {
    const pick = picks[slot];
    const stub = document.createElement('div');
    stub.className = 'stub' + (pick ? '' : ' empty') + (slot === lastFilledSlot ? ' just-filled' : '');
    if(pick){
      stub.innerHTML = `<span class="role">${slot}</span><div class="name">${pick.name}</div><div class="band">${pick.band}</div><span class="fit-tag ${pick.fitCls}">${pick.fitLabel}</span>`;
    } else {
      stub.innerHTML = `<span class="role">${slot}</span><div class="name">—</div>`;
    }
    setlistEl.appendChild(stub);
  });
}


/* ==========================================================================
   G. DRAWING A BAND -- choosing which band appears next
   ========================================================================== */

// A band is "useful" right now if at least one member could fill a slot that
// is still open. Otherwise every pick from it would be a dead end. This matters
// most for the rare slots (Keyboards, Violin/Accordion).
function bandFitsOpenSlots(band, openSlots){
  return band.members.some(([, instr]) =>
    candidateSlots(instr).some(slot => openSlots.includes(slot))
  );
}

// Picks the next band at random, trying in this order of preference.
function drawBand(){
  const openSlots = SLOTS.filter(s => !picks[s]);

  // Preferred: an unused band that can actually fill something open.
  let remaining = deck.filter(b => !usedBandNames.has(b.name) && bandFitsOpenSlots(b, openSlots));

  // Fallback 1: every useful band has already been used, so allow repeats.
  if(remaining.length === 0){
    remaining = deck.filter(b => bandFitsOpenSlots(b, openSlots));
  }

  // Fallback 2 (shouldn't happen since Wildcard is open until the very end,
  // but just in case): any unused band at all.
  if(remaining.length === 0){
    remaining = deck.filter(b => !usedBandNames.has(b.name));
  }

  // Last resort: start over with the full deck.
  if(remaining.length === 0){
    usedBandNames.clear();
    remaining = deck;
  }

  const band = shuffle(remaining)[0];
  usedBandNames.add(band.name);
  return band;
}


/* ==========================================================================
   H. RENDERING THE SCREENS
   ========================================================================== */

// Starts a new round: draws a band and shows it, or shows the final screen
// if every slot is filled.
function renderRound(){
  if(filledCount >= SLOTS.length){
    renderFinal();
    return;
  }
  rerollsUsed = 0;
  currentBand = drawBand();
  renderBandCard();
}

// Draws the "band on stage" card for whatever currentBand is, WITHOUT picking
// a new band. Used both for a fresh round and after a reroll.
function renderBandCard(){
  const openSlots = SLOTS.filter(s => !picks[s]);
  const rerollsLeft = MAX_REROLLS - rerollsUsed;
  const rerollControl = rerollsLeft > 0
    ? `<button class="skip-btn" id="reroll">Not feeling it — swap the band (${REROLL_PENALTY} pts, ${rerollsLeft} left)</button>`
    : `<span class="skip-btn disabled">No rerolls left this round</span>`;
  gameArea.innerHTML = `
    <div class="round-label">${filledCount} OF ${SLOTS.length} SLOTS FILLED</div>
    <h2 class="role-name">Open: ${openSlots.join(' · ')}</h2>
    <div class="card">
      <div class="stage-label">Now on stage</div>
      <h3 class="band-name">${currentBand.name}</h3>
      <div class="members" id="members"></div>
      <div class="notice" id="notice"></div>
    </div>
    <div class="skip-row">${rerollControl}</div>
  `;

  // One button per band member.
  const membersEl = document.getElementById('members');
  currentBand.members.forEach(([name, instr]) => {
    const btn = document.createElement('button');
    btn.className = 'member-btn';
    btn.innerHTML = `<span>${name}</span><span class="instr">${instr}</span>`;
    btn.onclick = () => draftMember(btn, name, instr);
    membersEl.appendChild(btn);
  });

  // Reroll button (only exists while rerolls remain).
  const rerollBtn = document.getElementById('reroll');
  if(rerollBtn){
    rerollBtn.onclick = () => {
      if(rerollsUsed >= MAX_REROLLS) return;
      rerollsUsed++;
      rerollTotal += REROLL_PENALTY;
      score = fitTotal + chemTotal + rerollTotal;
      currentBand = drawBand();
      renderScorebar();
      renderBandCard();
    };
  }
}

// Runs when you click a band member: assigns them a slot, scores the pick,
// logs any chemistry, updates the screen, and starts the next round.
function draftMember(btn, name, instr){
  const assignment = findAssignment(instr);

  // Every slot this person could fill is taken: shake the button, show a hint.
  if(assignment === null){
    btn.classList.add('shake');
    setTimeout(() => btn.classList.remove('shake'), 300);
    document.getElementById('notice').textContent = `Every slot ${name} could fill is already taken. Try someone else.`;
    return;
  }

  const {slot, fit} = assignment;

  // Chemistry with everyone already drafted (vibe clashes + friends/feuds).
  const notes = evaluatePick(currentBand.name, name);
  const notesPenalty = notes.reduce((sum, c) => sum + c.penalty, 0);

  // Record the pick and update the scores.
  picks[slot] = {name, instr, band: currentBand.name, fitLabel: fit.label, fitCls: fit.cls, fitPoints: fit.points, notes};
  fitTotal += fit.points;
  chemTotal += notesPenalty;
  score = fitTotal + chemTotal + rerollTotal;
  clashLog.push(...notes.map(c => ({a: c.withName, b: name, reason: c.reason, penalty: c.penalty, type: c.type})));
  filledCount++;
  lastFilledSlot = slot;

  renderSetlist();
  renderScorebar();
  renderClashLog();
  renderRound();
}

// The final "poster" screen: lineup, score, grade, chemistry log, replay button.
function renderFinal(){
  const grade = gradeForScore(score);
  gameArea.innerHTML = `
    <div class="poster">
      <div class="eyebrow2">Now booking world tours</div>
      <h2>Your Supergroup</h2>
      <div class="score-final">Final score: <span class="num">${score}</span> <span class="breakdown">(${breakdownText()})</span></div>
      <div class="grade">${grade}</div>
      <div id="lineup"></div>
      <div id="clashlog-final"></div>
      <div class="actions">
        <button class="btn" id="again">Draft Again</button>
      </div>
    </div>
  `;

  // One row per slot: role, musician + fit tag, and their original band.
  const lineupEl = document.getElementById('lineup');
  SLOTS.forEach(slot => {
    const p = picks[slot];
    const row = document.createElement('div');
    row.className = 'lineup-row';
    row.innerHTML = `<span class="lrole">${slot}</span><span class="lname">${p.name}<span class="fit-tag ${p.fitCls}">${p.fitLabel}</span></span><span class="lband">${p.band}</span>`;
    lineupEl.appendChild(row);
  });

  // Repeat the chemistry log on the poster (only if anything happened).
  if(clashLog.length > 0){
    const clashEl = document.getElementById('clashlog-final');
    clashEl.innerHTML = '<div class="clashlog-title">Chemistry</div>' + clashLog.map(clashEntryHTML).join('');
  }

  // "Draft Again": wipe state and redraw everything.
  document.getElementById('again').onclick = () => {
    resetGame();
    renderSetlist();
    renderScorebar();
    renderClashLog();
    renderRound();
  };
}


/* ==========================================================================
   I. START THE GAME
   ========================================================================== */

renderSetlist();
renderScorebar();
renderRound();
