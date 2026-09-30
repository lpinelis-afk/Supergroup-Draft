# Supergroup Draft

Open `index.html` in a browser to play (no server needed).

## Files

| File | What it does |
|---|---|
| `index.html` | Page skeleton. Loads the CSS and the three scripts. |
| `css/style.css` | All styling. Colors are variables at the top (`:root`). |
| `js/bands.js` | **The band list.** Edit this to add bands. |
| `js/rules.js` | Chemistry rules: vibe clashes, friendships, feuds. |
| `js/game.js` | Game logic and screens. Settings (points, rerolls, grades) are at the top. |

## Adding a band

Open `js/bands.js` and add a line inside `BANDS`:

```js
{name:"Band Name", vibe:"alt", members:[["Singer Name","Vocals"],["Guitarist Name","Guitar/Vocals"],["Drummer Name","Drums"]]},
```

- `vibe` must be one of: aggressive, classic, alt, mellow, chaotic, theatrical, punk.
- List a member's main instrument first. `"Guitar/Vocals"` tries the guitar slot first.
- Recognised instruments: Vocals, Guitar, Bass, Drums, Keys, Violin/Viola/Accordion. Anything else goes to Wildcard.
- Mistakes (duplicate names, typo'd vibes) are reported in the browser console (F12).

## Changing the rules

- New vibe clash or friendship/feud: add a line in `js/rules.js`.
- Points per fit level, reroll cost, and grade cutoffs: top of `js/game.js`.
- Colors: top of `css/style.css`.
