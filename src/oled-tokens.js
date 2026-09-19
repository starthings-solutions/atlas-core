// Single source of truth for the Atlas Core OLED visual system.
//
// The contract below is distilled from the OLED base reference (pure-black
// canvas, 1px wires, 2-3px radii, Archivo + IBM Plex Mono, Sunset Calm
// application semantics, and a separate categorical data palette). Edit
// tokens here, never per-surface: this module feeds the viewer chrome
// (via chrome.css), the artifact generation guidance (`atlas-core design`),
// and the whiteboard frame.
//
// Two namespaces, two purposes - never mix them:
// - Sunset Calm (`--app-*`) carries UI meaning: focus, queue, review, failure.
// - The categorical slots (`--c1..--c5`) carry DATA identity in charts and
//   diagrams only. `--c2` doubles as the risk ink, so it stays out of the
//   neutral series queue: the operating categorical order is c1, c3, c4, c5.

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

export const OLED_FONT_SANS = '"Archivo", ui-sans-serif, system-ui, "Segoe UI", Helvetica, Arial, sans-serif';
export const OLED_FONT_MONO = '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

// Full variable Archivo (width + weight axes) plus Plex Mono 400/500/600,
// exactly as the reference loads them. Artifacts paste this; the viewer
// chrome serves the same families vendored (see scripts/build.js) so the
// review surface stays deterministic offline.
export const OLED_GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=IBM+Plex+Mono:wght@400;500;600&display=swap";

export const OLED_FONTS_SNIPPET =
  `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n` +
  `<link rel="stylesheet" href="${OLED_GOOGLE_FONTS_HREF}">\n` +
  `<meta name="color-scheme" content="dark">`;

// ---------------------------------------------------------------------------
// Neutral ramp: nine achromatic steps, monotonic in luminance.
// --ink-3 is #787878 (4.76:1 on black), not #6a6a6a (3.88:1, fails AA for the
// 10-12px naming layer); #6a6a6a survives only as --hollow for non-text.
// ---------------------------------------------------------------------------

export const OLED_RAMP = Object.freeze({
  void: "#000000", // page background. Literal black, never near-black.
  surface: "#080808", // panel plane; table-row hover.
  surface2: "#101010", // trough: bar tracks, fields.
  rule: "#1b1b1b", // inner wire: dividers, borders.
  dim: "#2a2a2a", // undifferentiated mass, background grid.
  rule2: "#2e2e2e", // structural wire: block openings.
  ink3: "#787878", // tertiary text: label, note, metadata.
  ink2: "#a3a3a3", // secondary text: body, table cell.
  ink: "#ffffff", // primary: data, title, marker. The data ink.
  hollow: "#6a6a6a", // non-text only: hollow outlines, disabled glyphs.
});

// ---------------------------------------------------------------------------
// Categorical data palette: charts and diagrams ONLY. Fixed order, never
// cycled; color follows the entity, never the interface state. New slots
// must pass the gate: OKLCH L 0.48-0.67, C >= 0.10, protan/deutan dE >= 8,
// normal-vision dE >= 15. --c1 is the declared exception (L=1, C=0): the
// highest-contrast slot and the system's first principle.
// ---------------------------------------------------------------------------

export const OLED_CATEGORICAL = Object.freeze({
  c1: "#ffffff", // series 1, always dominant.
  c2: "#f5451b", // series 2 AND the risk ink: keep out of neutral series.
  c3: "#0091c8",
  c4: "#00a06b",
  c5: "#9463ff",
});

// Operating series order: c2 is pulled from the neutral queue because
// painting it on a neutral category reads as an alarm.
export const OLED_CATEGORICAL_ORDER = Object.freeze(["c1", "c3", "c4", "c5"]);

// ---------------------------------------------------------------------------
// Application semantics (Sunset Calm): controls and states ONLY.
// ---------------------------------------------------------------------------

export const OLED_APP = Object.freeze({
  ink: "#f8f4eb", // primary application text.
  feedback: "#ffb386", // review and authorship.
  risk: "#f87171", // failure and destructive.
  pending: "#f2c14e", // queue and attention.
  activity: "#6fc7c2", // focus, live, selected, done.
});

// ---------------------------------------------------------------------------
// Metrics, depth scale, type scale.
// ---------------------------------------------------------------------------

export const OLED_METRICS = Object.freeze({
  maxWidth: "1180px",
  gutter: "30px",
  controlHeight: "40px",
  tapTarget: "44px",
  radiusSharp: "2px",
  radiusPanel: "3px",
});

// z scale is closed by urgency; nothing renders above the dialog tier.
export const OLED_Z = Object.freeze({
  bar: 50,
  progress: 60,
  menu: 70,
  layer: 80,
  toast: 88,
  tip: 90,
  veil: 94,
  dialog: 95,
});

// ---------------------------------------------------------------------------
// :root contract block. The viewer chrome and the whiteboard frame share
// these exact declarations; artifacts receive them inside the DaisyUI theme
// block below so generated documents resolve the same values.
// ---------------------------------------------------------------------------

export const OLED_ROOT_CSS = `:root{
  --void:${OLED_RAMP.void}; --surface:${OLED_RAMP.surface}; --surface-2:${OLED_RAMP.surface2};
  --rule:${OLED_RAMP.rule}; --dim:${OLED_RAMP.dim}; --rule-2:${OLED_RAMP.rule2};
  --ink-3:${OLED_RAMP.ink3}; --ink-2:${OLED_RAMP.ink2}; --ink:${OLED_RAMP.ink};
  --hollow:${OLED_RAMP.hollow};
  --c1:${OLED_CATEGORICAL.c1}; --c2:${OLED_CATEGORICAL.c2}; --c3:${OLED_CATEGORICAL.c3}; --c4:${OLED_CATEGORICAL.c4}; --c5:${OLED_CATEGORICAL.c5};
  --c2-rgb:245 69 27;
  --app-ink:${OLED_APP.ink}; --app-ink-rgb:248 244 235;
  --app-feedback:${OLED_APP.feedback}; --app-feedback-rgb:255 179 134;
  --app-risk:${OLED_APP.risk}; --app-risk-rgb:248 113 113;
  --app-pending:${OLED_APP.pending}; --app-pending-rgb:242 193 78;
  --app-activity:${OLED_APP.activity}; --app-activity-rgb:111 199 194;
  --veil:rgb(0 0 0 / .72);
  --max:${OLED_METRICS.maxWidth}; --gut:${OLED_METRICS.gutter};
  --ctl-h:${OLED_METRICS.controlHeight}; --tap:${OLED_METRICS.tapTarget};
  --z-bar:${OLED_Z.bar}; --z-progress:${OLED_Z.progress}; --z-menu:${OLED_Z.menu}; --z-layer:${OLED_Z.layer};
  --z-toast:${OLED_Z.toast}; --z-tip:${OLED_Z.tip}; --z-veil:${OLED_Z.veil}; --z-dialog:${OLED_Z.dialog};
  --mono:${OLED_FONT_MONO};
  --sans:${OLED_FONT_SANS};
}`;

// ---------------------------------------------------------------------------
// DaisyUI theme for generated artifacts. DaisyUI v5 themes are plain
// `[data-theme]` custom-property blocks, so the OLED system ships as one
// paste-once style block: components (btn, card, table, modal, ...) keep
// working, now resolved against the OLED ramp, Sunset Calm states, 2-3px
// radii, and zero depth. Semantic mapping notes:
// - base-100 is the panel plane (#080808); the page itself is painted void
//   explicitly, because DaisyUI resolves page and card to the same token.
// - success/info resolve to activity: done is the solid seal, never a green.
// - The categorical slots ride along as plain custom properties for SVG and
//   chart marks; they never back a component state.
// ---------------------------------------------------------------------------

export const OLED_DAISYUI_THEME_NAME = "atlas-core-oled";

export const OLED_DAISYUI_THEME_CSS =
  `[data-theme="${OLED_DAISYUI_THEME_NAME}"]{\n` +
  `  color-scheme:dark;\n` +
  `  --color-base-100:${OLED_RAMP.surface}; --color-base-200:${OLED_RAMP.surface2}; --color-base-300:${OLED_RAMP.rule}; --color-base-content:${OLED_APP.ink};\n` +
  `  --color-primary:${OLED_APP.activity}; --color-primary-content:#000000;\n` +
  `  --color-secondary:${OLED_APP.feedback}; --color-secondary-content:#000000;\n` +
  `  --color-accent:${OLED_APP.activity}; --color-accent-content:#000000;\n` +
  `  --color-neutral:${OLED_RAMP.rule}; --color-neutral-content:${OLED_APP.ink};\n` +
  `  --color-info:${OLED_APP.activity}; --color-info-content:#000000;\n` +
  `  --color-success:${OLED_APP.activity}; --color-success-content:#000000;\n` +
  `  --color-warning:${OLED_APP.pending}; --color-warning-content:#000000;\n` +
  `  --color-error:${OLED_APP.risk}; --color-error-content:#000000;\n` +
  `  --radius-selector:${OLED_METRICS.radiusSharp}; --radius-field:${OLED_METRICS.radiusPanel}; --radius-box:${OLED_METRICS.radiusPanel};\n` +
  `  --size-selector:.25rem; --size-field:.25rem;\n` +
  `  --border:1px; --depth:0; --noise:0;\n` +
  `  --void:${OLED_RAMP.void}; --surface:${OLED_RAMP.surface}; --surface-2:${OLED_RAMP.surface2};\n` +
  `  --rule:${OLED_RAMP.rule}; --dim:${OLED_RAMP.dim}; --rule-2:${OLED_RAMP.rule2};\n` +
  `  --ink-3:${OLED_RAMP.ink3}; --ink-2:${OLED_RAMP.ink2}; --ink:${OLED_RAMP.ink}; --hollow:${OLED_RAMP.hollow};\n` +
  `  --c1:${OLED_CATEGORICAL.c1}; --c2:${OLED_CATEGORICAL.c2}; --c3:${OLED_CATEGORICAL.c3}; --c4:${OLED_CATEGORICAL.c4}; --c5:${OLED_CATEGORICAL.c5};\n` +
  `  --app-ink:${OLED_APP.ink}; --app-feedback:${OLED_APP.feedback}; --app-risk:${OLED_APP.risk}; --app-pending:${OLED_APP.pending}; --app-activity:${OLED_APP.activity};\n` +
  `}\n` +
  `html[data-theme="${OLED_DAISYUI_THEME_NAME}"]{background:${OLED_RAMP.void}}\n` +
  `html[data-theme="${OLED_DAISYUI_THEME_NAME}"] body{background:${OLED_RAMP.void};color:${OLED_APP.ink};font-family:${OLED_FONT_SANS}}`;

// The paste-once head block for new Atlas Core artifacts: fonts first, then
// the theme. Goes after the Tailwind/DaisyUI CDN snippet.
export const OLED_ARTIFACT_SNIPPET = `${OLED_FONTS_SNIPPET}\n<style>\n${OLED_DAISYUI_THEME_CSS}\n</style>`;
