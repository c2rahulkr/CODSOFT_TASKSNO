# Modern Calculator

A responsive calculator built with plain HTML5, CSS3 and vanilla JavaScript. No frameworks, no libraries, and **no `eval()`**.

## Folder structure

```
calculator/
├── index.html   # markup: display, button grid, history panel
├── style.css    # blue calculator theme, light/dark variables, responsive rules
├── script.js    # engine (parser) + state (button logic) + UI (events)
└── README.md
```

## Run it in VS Code with Live Server

1. Open the `calculator` folder in VS Code (File → Open Folder).
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` → **Open with Live Server**.
4. Or just double-click `index.html`. It works without a server.

## Features

- `+ − × ÷ %`, decimals, and `+/-`
- Correct operator precedence (`10 + 5 × 2 = 20`)
- C (clear), DEL (delete last character), = (evaluate)
- Keyboard support: `0-9 . + - * / %`, `Enter` (or `=`), `Backspace`, `Escape` (`x` also works for multiply)
- History panel (click an entry to reuse its result) with a Clear history button; saved in the browser
- Copy-result button
- Light / dark theme toggle (remembered)
- Responsive layout for desktop, tablet and phones, with no horizontal scrolling

## How it works

`script.js` has three layers.

1. **Engine (pure functions).** `tokenize()` splits text like `10+5×2` into numbers, operators and `%`. `parse()` is a recursive-descent parser: it reads `+ -` at the lowest level, `× ÷` one level up, and numbers at the top. That ordering is what gives multiplication and division priority, so `eval()` is not needed. `formatNumber()` rounds to 15 significant digits so `0.1 + 0.2` shows `0.3`.
2. **State (`CalculatorState`).** One method per button (`inputDigit`, `inputOperator`, `toggleSign`, `equals`, ...). All the input rules live here: no second decimal point, no `00`, consecutive operators are replaced rather than stacked, a trailing operator is ignored on `=`, and empty input does nothing. It has no DOM code, so it can be tested in Node.
3. **UI.** Wires the DOM to the state.

### Event listeners

| Listener | Purpose |
|---|---|
| `click` on the `.keys` grid (event delegation) | One listener handles all 20 buttons by reading `data-action` / `data-value` |
| `keydown` on `document` | Maps keyboard keys to the same actions and flashes the matching button |
| `click` on the history list | Loads a past result back into the calculator |
| `click` on Clear history / Copy / theme toggle | Their own small handlers |
| `resize` on `window` | Re-fits the display text |

### Behaviour notes

- `%` is a postfix operator: `25%` = `0.25`, and `50 + 10%` = `50.1`. It divides by 100 and is not a "percent of the left side" operation.
- Typing `-` right after another operator replaces that operator (so there are never two in a row). To make the second number negative, type the number then press `+/-`.
- After `=`, typing an operator continues from the result; typing a digit starts a new calculation.
- Errors (`Cannot divide by zero`, `Invalid expression`) clear as soon as you press another button.

## Test cases

| Expression | Expected |
|---|---|
| 25 + 15 | 40 |
| 50 - 20 | 30 |
| 12 × 5 | 60 |
| 100 ÷ 4 | 25 |
| 10 + 5 × 2 | 20 |
| 25 % | 0.25 |
| 10 ÷ 0 | Cannot divide by zero |
| 12.5 + 7.5 | 20 |
| 0.1 + 0.2 | 0.3 |
| 5 + + 3 | 8 (second operator replaces the first) |
| 5 + 3 then +/- | 5 - 3 = 2 |
| 1 . . 2 | 1.2 (second decimal point ignored) |
| 0 0 7 | 7 |
| 100 - 10 - 10 | 80 |
| 100 ÷ 10 ÷ 2 | 5 |
| 2 × 3 + 4 × 5 | 26 |
| `=` with nothing entered | does nothing, display stays 0 |

## Customising

- **Colours:** edit the variables in `:root` (light) and `[data-theme="dark"]` at the top of `style.css`.
- **History size:** change `HISTORY_MAX` in `script.js`.
- **Longest expression:** change `MAX_LENGTH` in `script.js`.
