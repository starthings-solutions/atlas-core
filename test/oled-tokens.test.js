import assert from "node:assert/strict";
import test from "node:test";

import {
  OLED_APP,
  OLED_ARTIFACT_SNIPPET,
  OLED_CATEGORICAL,
  OLED_CATEGORICAL_ORDER,
  OLED_DAISYUI_THEME_CSS,
  OLED_DAISYUI_THEME_NAME,
  OLED_FONTS_SNIPPET,
  OLED_FONT_MONO,
  OLED_FONT_SANS,
  OLED_METRICS,
  OLED_RAMP,
  OLED_ROOT_CSS,
  OLED_Z,
} from "../src/oled-tokens.js";

test("OLED ramp is the nine-step achromatic contract", () => {
  assert.deepEqual(OLED_RAMP, {
    void: "#000000",
    surface: "#080808",
    surface2: "#101010",
    rule: "#1b1b1b",
    dim: "#2a2a2a",
    rule2: "#2e2e2e",
    ink3: "#787878",
    ink2: "#a3a3a3",
    ink: "#ffffff",
    hollow: "#6a6a6a",
  });
});

test("OLED categorical and application palettes stay in separate namespaces", () => {
  assert.deepEqual(OLED_CATEGORICAL, {
    c1: "#ffffff",
    c2: "#f5451b",
    c3: "#0091c8",
    c4: "#00a06b",
    c5: "#9463ff",
  });
  assert.deepEqual(OLED_APP, {
    ink: "#f8f4eb",
    feedback: "#ffb386",
    risk: "#f87171",
    pending: "#f2c14e",
    activity: "#6fc7c2",
  });
  // No value may appear in both namespaces: a shared hex would let a UI
  // state color pass as a data series (or the reverse) unnoticed.
  const categorical = new Set(/** @type {string[]} */ (Object.values(OLED_CATEGORICAL)));
  for (const value of Object.values(OLED_APP)) {
    assert.ok(!categorical.has(value), `${value} must belong to exactly one namespace`);
  }
});

test("OLED operating series order pulls the risk ink from the neutral queue", () => {
  assert.deepEqual(OLED_CATEGORICAL_ORDER, ["c1", "c3", "c4", "c5"]);
  assert.ok(!OLED_CATEGORICAL_ORDER.includes("c2"));
});

test("OLED root contract carries every token consumers resolve", () => {
  for (const token of [
    "--void",
    "--surface",
    "--surface-2",
    "--rule",
    "--dim",
    "--rule-2",
    "--ink-3",
    "--ink-2",
    "--ink",
    "--hollow",
    "--c1",
    "--c2",
    "--c3",
    "--c4",
    "--c5",
    "--app-ink",
    "--app-feedback",
    "--app-risk",
    "--app-pending",
    "--app-activity",
    "--mono",
    "--sans",
  ]) {
    assert.ok(OLED_ROOT_CSS.includes(token), `${token} is declared`);
  }
  assert.match(OLED_ROOT_CSS, /--z-dialog:95/);
  assert.ok(OLED_FONT_SANS.startsWith('"Archivo"'));
  assert.ok(OLED_FONT_MONO.startsWith('"IBM Plex Mono"'));
});

test("OLED DaisyUI theme block covers the full v5 variable set", () => {
  assert.equal(OLED_DAISYUI_THEME_NAME, "atlas-core-oled");
  const block = OLED_DAISYUI_THEME_CSS;
  assert.ok(block.startsWith(`[data-theme="${OLED_DAISYUI_THEME_NAME}"]{`));
  for (const variable of [
    "--color-base-100",
    "--color-base-200",
    "--color-base-300",
    "--color-base-content",
    "--color-primary",
    "--color-primary-content",
    "--color-secondary",
    "--color-secondary-content",
    "--color-accent",
    "--color-accent-content",
    "--color-neutral",
    "--color-neutral-content",
    "--color-info",
    "--color-info-content",
    "--color-success",
    "--color-success-content",
    "--color-warning",
    "--color-warning-content",
    "--color-error",
    "--color-error-content",
    "--radius-selector",
    "--radius-field",
    "--radius-box",
    "--size-selector",
    "--size-field",
    "--border",
    "--depth",
    "--noise",
  ]) {
    assert.ok(block.includes(variable), `${variable} is defined`);
  }
});

test("OLED theme resolves states to Sunset Calm with zero depth", () => {
  const block = OLED_DAISYUI_THEME_CSS;
  assert.match(block, /--color-base-100:#080808/);
  assert.match(block, new RegExp(`--color-primary:${OLED_APP.activity}`));
  assert.match(block, new RegExp(`--color-success:${OLED_APP.activity}`));
  assert.match(block, new RegExp(`--color-warning:${OLED_APP.pending}`));
  assert.match(block, new RegExp(`--color-error:${OLED_APP.risk}`));
  assert.match(block, /--radius-selector:2px/);
  assert.match(block, /--radius-box:3px/);
  assert.match(block, /--depth:0/);
  assert.doesNotMatch(block, /box-shadow|shadow/);
  // The page itself is void black, painted explicitly - DaisyUI resolves page
  // and card to the same token, so the snippet paints both levels by hand.
  assert.ok(block.includes(`html[data-theme="${OLED_DAISYUI_THEME_NAME}"]{background:#000000}`));
  assert.match(block, /body\{background:#000000/);
});

test("OLED artifact snippet loads fonts before the theme", () => {
  assert.ok(OLED_FONTS_SNIPPET.includes("fonts.gstatic.com"));
  assert.ok(OLED_FONTS_SNIPPET.includes("family=Archivo:"));
  assert.ok(OLED_FONTS_SNIPPET.includes("family=IBM+Plex+Mono"));
  assert.ok(OLED_ARTIFACT_SNIPPET.startsWith(OLED_FONTS_SNIPPET));
  assert.ok(OLED_ARTIFACT_SNIPPET.includes("<style>"));
  assert.ok(OLED_ARTIFACT_SNIPPET.includes(OLED_DAISYUI_THEME_CSS));
});

test("OLED metrics keep radii sharp and the z scale closed", () => {
  assert.equal(OLED_METRICS.radiusSharp, "2px");
  assert.equal(OLED_METRICS.radiusPanel, "3px");
  assert.equal(OLED_METRICS.maxWidth, "1180px");
  assert.equal(OLED_Z.dialog, 95);
  assert.ok(Math.max(...Object.values(OLED_Z)) <= 95);
});
