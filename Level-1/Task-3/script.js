/* =========================================================
   Modern Calculator – script.js
   No eval(): expressions are tokenised and parsed by a small
   recursive-descent parser that respects operator precedence.

   Layout of this file
     1. ENGINE  – tokenizer, parser, number formatting (pure functions)
     2. STATE   – CalculatorState: what happens on each button press
     3. UI      – DOM wiring, history, theme, keyboard, clipboard
   Sections 1 and 2 have no DOM code, so they can be tested in Node.
   ========================================================= */

"use strict";

/* =========================================================
   1. ENGINE
   ========================================================= */

var MAX_LENGTH = 30;                 // longest expression the user can type
var OPERATORS = "+-×÷";

/** Split an expression string into tokens: numbers, operators, percent signs. */
function tokenize(str) {
  var tokens = [];
  var numberRe = /(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/y;   // sticky: matches at lastIndex
  var i = 0;
  while (i < str.length) {
    var ch = str[i];
    if (/[\d.]/.test(ch)) {
      numberRe.lastIndex = i;
      var m = numberRe.exec(str);
      if (!m) throw new Error("Invalid expression");
      tokens.push({ type: "num", value: parseFloat(m[0]) });
      i += m[0].length;
    } else if (OPERATORS.indexOf(ch) !== -1) {
      tokens.push({ type: "op", value: ch });
      i++;
    } else if (ch === "%") {
      tokens.push({ type: "pct" });
      i++;
    } else {
      throw new Error("Invalid expression");
    }
  }
  return tokens;
}

/**
 * Evaluate tokens with correct precedence (× ÷ before + -).
 *
 *   expression := term (("+" | "-") term)*
 *   term       := unary (("×" | "÷") unary)*
 *   unary      := ("-" | "+") unary | postfix
 *   postfix    := number "%"*            (25% -> 0.25)
 */
function parse(tokens) {
  var pos = 0;

  function peekOp(ops) {
    var t = tokens[pos];
    return t && t.type === "op" && ops.indexOf(t.value) !== -1 ? t.value : null;
  }

  function parseExpression() {
    var left = parseTerm();
    var op;
    while ((op = peekOp("+-"))) {
      pos++;
      var right = parseTerm();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  function parseTerm() {
    var left = parseUnary();
    var op;
    while ((op = peekOp("×÷"))) {
      pos++;
      var right = parseUnary();
      if (op === "÷") {
        if (right === 0) throw new Error("Cannot divide by zero");
        left = left / right;
      } else {
        left = left * right;
      }
    }
    return left;
  }

  function parseUnary() {
    var op = peekOp("+-");
    if (op) {
      pos++;
      var v = parseUnary();
      return op === "-" ? -v : v;
    }
    return parsePostfix();
  }

  function parsePostfix() {
    var t = tokens[pos];
    if (!t || t.type !== "num") throw new Error("Invalid expression");
    pos++;
    var v = t.value;
    while (tokens[pos] && tokens[pos].type === "pct") { pos++; v = v / 100; }
    return v;
  }

  var result = parseExpression();
  if (pos !== tokens.length) throw new Error("Invalid expression");
  return result;
}

/** Evaluate an expression string such as "10+5×2". Returns a number. */
function evaluate(str) {
  return parse(tokenize(str));
}

/** Turn a number into display text, fixing floating-point noise (0.1+0.2 -> 0.3). */
function formatNumber(n) {
  if (!isFinite(n)) throw new Error("Result is too large");
  var v = parseFloat(n.toPrecision(15));
  if (Object.is(v, -0)) v = 0;
  var abs = Math.abs(v);
  if (abs !== 0 && (abs >= 1e15 || abs < 1e-9)) {
    return v.toExponential(6).replace(/\.?0+e/, "e");
  }
  return String(v);
}

/** Add readable spacing around binary operators: "10+5×2" -> "10 + 5 × 2". */
function prettify(expr) {
  var out = "";
  for (var i = 0; i < expr.length; i++) {
    var ch = expr[i];
    if (OPERATORS.indexOf(ch) !== -1) {
      var prev = expr[i - 1];
      var binary = prev !== undefined && /[\d.%]/.test(prev);
      out += binary ? " " + ch + " " : ch;
    } else {
      out += ch;
    }
  }
  return out.replace(/\s+$/, "");
}

function isOperator(ch) { return ch !== undefined && OPERATORS.indexOf(ch) !== -1; }
function isDigitLike(ch) { return ch !== undefined && /[\d.]/.test(ch); }

/* =========================================================
   2. STATE – one method per calculator button
   ========================================================= */

function CalculatorState() { this.reset(); }

CalculatorState.prototype.reset = function () {
  this.expr = "";              // what the user has typed, e.g. "10+5×2"
  this.lastExpr = "";          // shown in the small line, e.g. "10 + 5 × 2 ="
  this.error = "";             // error message, or "" when fine
  this.justEvaluated = false;  // true right after "="
  this.lastResult = null;
};

/** Start fresh if the display is showing an error. */
CalculatorState.prototype._clearError = function () {
  if (this.error) this.reset();
};

CalculatorState.prototype.inputDigit = function (d) {
  this._clearError();
  if (this.justEvaluated) { this.expr = ""; this.lastExpr = ""; this.justEvaluated = false; }
  if (this.expr.length >= MAX_LENGTH) return;
  if (this.expr.slice(-1) === "%") return;               // no digit directly after %
  var current = this.expr.match(/[\d.]*$/)[0];
  if (current === "0") {
    if (d === "0") return;                               // avoid 00
    this.expr = this.expr.slice(0, -1) + d;              // 07 -> 7
    return;
  }
  this.expr += d;
};

CalculatorState.prototype.inputDecimal = function () {
  this._clearError();
  if (this.justEvaluated) { this.expr = ""; this.lastExpr = ""; this.justEvaluated = false; }
  if (this.expr.length >= MAX_LENGTH - 1) return;
  if (this.expr.slice(-1) === "%") return;
  var current = this.expr.match(/[\d.]*$/)[0];
  if (current.indexOf(".") !== -1) return;               // one decimal point per number
  this.expr += current === "" ? "0." : ".";
};

CalculatorState.prototype.inputOperator = function (op) {
  this._clearError();
  this.justEvaluated = false;                            // keep going with the result
  var last = this.expr.slice(-1);

  if (this.expr === "") {                                // nothing typed yet
    this.expr = op === "-" ? "-" : "0" + op;             // "-" starts a negative number
    return;
  }
  if (this.expr === "-") return;                         // a lone minus can't take an operator
  if (isOperator(last)) {                                // no consecutive operators: replace
    this.expr = this.expr.slice(0, -1) + op;
    return;
  }
  if (this.expr.length >= MAX_LENGTH) return;
  this.expr += op;
};

CalculatorState.prototype.inputPercent = function () {
  this._clearError();
  if (this.justEvaluated) this.justEvaluated = false;
  var last = this.expr.slice(-1);
  if (this.expr.length >= MAX_LENGTH) return;
  if (isDigitLike(last) || last === "%") this.expr += "%"; // only after a number
};

/** +/- : flip the sign of the number currently being edited (or of the last result). */
CalculatorState.prototype.toggleSign = function () {
  this._clearError();

  if (this.justEvaluated && this.lastResult !== null) {  // negate the shown result
    this.lastResult = -this.lastResult;
    this.expr = formatNumber(this.lastResult);
    return;
  }
  if (this.expr === "") { this.expr = "-"; return; }

  var m = /(\d+\.?\d*|\.\d+)%*$/.exec(this.expr);        // last number (plus any %)
  if (!m) return;                                        // ends with an operator: ignore
  var idx = m.index;
  var before = this.expr[idx - 1];

  if (idx === 0 || before === "×" || before === "÷") {
    this.expr = this.expr.slice(0, idx) + "-" + this.expr.slice(idx);
  } else if (before === "-") {
    var unary = idx - 1 === 0 || isOperator(this.expr[idx - 2]);
    this.expr = this.expr.slice(0, idx - 1) + (unary ? "" : "+") + this.expr.slice(idx);
  } else if (before === "+") {
    this.expr = this.expr.slice(0, idx - 1) + "-" + this.expr.slice(idx);
  }
};

CalculatorState.prototype.clear = function () { this.reset(); };

CalculatorState.prototype.deleteLast = function () {
  if (this.error || this.justEvaluated) { this.reset(); return; }
  this.expr = this.expr.slice(0, -1);
};

/** Evaluate. Returns {expression, result} for the history, or null. */
CalculatorState.prototype.equals = function () {
  if (this.error || this.justEvaluated) return null;
  var cleaned = this.expr.replace(/[+\-×÷]+$/, "");      // drop a dangling operator: "5+" -> "5"
  if (cleaned === "") return null;                       // empty input: nothing to do

  var pretty = prettify(cleaned);
  try {
    var value = evaluate(cleaned);
    var text = formatNumber(value);
    var trivial = /^-?[\d.]+$/.test(cleaned);            // just a number, nothing to log
    this.lastExpr = pretty + " =";
    this.expr = text;
    this.lastResult = value;
    this.justEvaluated = true;
    return trivial ? null : { expression: pretty, result: text };
  } catch (e) {
    this.error = e.message || "Error";
    this.lastExpr = pretty + " =";
    return null;
  }
};

/** Result of the current input without changing state (used by Copy). */
CalculatorState.prototype.peekResult = function () {
  if (this.error) return null;
  if (this.expr === "") return "0";
  var cleaned = this.expr.replace(/[+\-×÷]+$/, "");
  if (cleaned === "") return "0";
  try { return formatNumber(evaluate(cleaned)); } catch (e) { return null; }
};

/** Text for the big display line. */
CalculatorState.prototype.displayText = function () {
  if (this.error) return this.error;
  return this.expr === "" ? "0" : prettify(this.expr);
};

/* Make the engine available to Node for testing (ignored in the browser). */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { evaluate: evaluate, formatNumber: formatNumber, prettify: prettify, CalculatorState: CalculatorState };
}

/* =========================================================
   3. UI (browser only)
   ========================================================= */

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {

    var calc = new CalculatorState();
    var HISTORY_KEY = "calc-history";
    var THEME_KEY = "calc-theme";
    var HISTORY_MAX = 30;
    var history = [];

    var elExpression = document.getElementById("expression");
    var elResult = document.getElementById("result");
    var elKeys = document.getElementById("keys");
    var elHistoryList = document.getElementById("history-list");
    var elHistoryEmpty = document.getElementById("history-empty");
    var elToast = document.getElementById("toast");

    /* ---------- storage helpers (safe if storage is blocked) ---------- */
    function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
    function save(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* ignore */ } }

    /* ---------- display ---------- */
    function fitResult() {
      // Shrink the font until the text fits, so long numbers never break the layout.
      elResult.style.fontSize = "";
      var size = parseFloat(getComputedStyle(elResult).fontSize);
      while (elResult.scrollWidth > elResult.clientWidth && size > 14) {
        size -= 2;
        elResult.style.fontSize = size + "px";
      }
    }

    function render() {
      elResult.textContent = calc.displayText();
      elResult.classList.toggle("error", !!calc.error);
      elExpression.textContent = calc.lastExpr;
      elExpression.scrollLeft = elExpression.scrollWidth;
      fitResult();
    }

    /* ---------- toast ---------- */
    var toastTimer;
    function toast(message) {
      elToast.textContent = message;
      elToast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { elToast.classList.remove("show"); }, 1400);
    }

    /* ---------- history ---------- */
    function renderHistory() {
      elHistoryList.innerHTML = "";
      history.forEach(function (item, index) {
        var li = document.createElement("li");
        var btn = document.createElement("button");
        btn.className = "history-item";
        btn.dataset.index = index;
        btn.title = "Use this result";
        var e = document.createElement("span"); e.className = "h-expr"; e.textContent = item.expression + " =";
        var r = document.createElement("span"); r.className = "h-res"; r.textContent = item.result;
        btn.appendChild(e); btn.appendChild(r);
        li.appendChild(btn);
        elHistoryList.appendChild(li);
      });
      elHistoryEmpty.hidden = history.length > 0;
    }

    function addHistory(entry) {
      history.unshift(entry);                         // newest first
      if (history.length > HISTORY_MAX) history.pop();
      save(HISTORY_KEY, JSON.stringify(history));
      renderHistory();
    }

    try { history = JSON.parse(load(HISTORY_KEY)) || []; } catch (e) { history = []; }
    if (!Array.isArray(history)) history = [];
    renderHistory();

    // Click a history entry: load its result into the calculator
    elHistoryList.addEventListener("click", function (e) {
      var btn = e.target.closest(".history-item");
      if (!btn) return;
      var item = history[Number(btn.dataset.index)];
      if (!item) return;
      calc.reset();
      calc.expr = item.result;
      calc.lastResult = parseFloat(item.result);
      calc.justEvaluated = true;                      // next digit starts fresh, operator continues
      render();
    });

    document.getElementById("clear-history").addEventListener("click", function () {
      history = [];
      save(HISTORY_KEY, "[]");
      renderHistory();
      toast("History cleared");
    });

    /* ---------- run a button action ---------- */
    function press(action, value) {
      switch (action) {
        case "digit":    calc.inputDigit(value); break;
        case "decimal":  calc.inputDecimal(); break;
        case "operator": calc.inputOperator(value); break;
        case "percent":  calc.inputPercent(); break;
        case "sign":     calc.toggleSign(); break;
        case "clear":    calc.clear(); break;
        case "delete":   calc.deleteLast(); break;
        case "equals":
          var entry = calc.equals();
          if (entry) addHistory(entry);
          break;
      }
      render();
    }

    // One click listener for all calculator buttons (event delegation)
    elKeys.addEventListener("click", function (e) {
      var btn = e.target.closest(".key");
      if (btn) press(btn.dataset.action, btn.dataset.value);
    });

    /* ---------- keyboard support ---------- */
    function findKey(action, value) {
      var sel = '.key[data-action="' + action + '"]' + (value ? '[data-value="' + value + '"]' : "");
      return elKeys.querySelector(sel);
    }

    function flash(btn) {                              // brief pressed look for keyboard input
      if (!btn) return;
      btn.classList.add("pressed");
      setTimeout(function () { btn.classList.remove("pressed"); }, 110);
    }

    document.addEventListener("keydown", function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;  // leave browser shortcuts alone
      var k = e.key, action = null, value = null;

      if (k >= "0" && k <= "9") { action = "digit"; value = k; }
      else if (k === "." || k === ",") action = "decimal";
      else if (k === "+") { action = "operator"; value = "+"; }
      else if (k === "-") { action = "operator"; value = "-"; }
      else if (k === "*" || k === "x" || k === "X") { action = "operator"; value = "×"; }
      else if (k === "/") { action = "operator"; value = "÷"; }
      else if (k === "%") action = "percent";
      else if (k === "Enter" || k === "=") action = "equals";
      else if (k === "Backspace") action = "delete";
      else if (k === "Escape") action = "clear";
      else return;

      e.preventDefault();                              // stops "/" quick-find and Enter re-clicking a focused button
      flash(findKey(action, value));
      press(action, value);
    });

    /* ---------- copy result ---------- */
    document.getElementById("copy-btn").addEventListener("click", function () {
      var text = calc.peekResult();
      if (text === null) { toast("Nothing to copy"); return; }

      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); toast("Copied " + text); } catch (err) { toast("Copy failed"); }
        document.body.removeChild(ta);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { toast("Copied " + text); }, fallback);
      } else {
        fallback();
      }
    });

    /* ---------- theme toggle ---------- */
    var themeBtn = document.getElementById("theme-toggle");
    function setTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
      themeBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      save(THEME_KEY, theme);
    }
    var saved = load(THEME_KEY);
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(saved || (prefersDark ? "dark" : "light"));
    themeBtn.addEventListener("click", function () {
      setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });

    window.addEventListener("resize", fitResult);
    render();
  });
}
