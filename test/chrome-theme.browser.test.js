import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { createChromeDriver, freePort, run } from "./browser-e2e.js";

const runBrowserE2e = process.env.LAVISH_AXI_BROWSER_E2E === "1";

const THEME_ARTIFACT = `<!doctype html>
<html><head><meta charset="utf-8">
<style>html,body{background:rgb(37,51,68);color:rgb(237,226,201)}</style></head>
<body><main><h1>Artifact-owned theme</h1><p>The chrome must not restyle this content.</p></main>
<script>
  setInterval(() => parent.postMessage({
    type: "lavish-test:theme-probe",
    background: getComputedStyle(document.body).backgroundColor,
    color: getComputedStyle(document.body).color,
  }, "*"), 100);
</script></body></html>`;

test(
  "the chrome uses OLED Sunset Calm without styling the artifact",
  { skip: !runBrowserE2e, timeout: 300_000 },
  async () => {
    const temp = await mkdtemp(path.join(tmpdir(), "lavish-chrome-theme-"));
    const port = await freePort();
    const chromePort = await freePort();
    const lavishEnv = {
      LAVISH_AXI_PORT: String(port),
      LAVISH_AXI_STATE_DIR: path.join(temp, "state"),
      LAVISH_AXI_NO_OPEN: "1",
      LAVISH_AXI_TELEMETRY: "0",
      LAVISH_AXI_HOST: "127.0.0.1",
      LAVISH_AXI_LINK_HOST: "127.0.0.1",
    };
    const browser = createChromeDriver({
      temp,
      session: `lavish-chrome-theme-${process.pid}`,
      port: chromePort,
    });
    try {
      const artifact = path.join(temp, "theme.html");
      await writeFile(artifact, THEME_ARTIFACT);
      const output = run(process.execPath, ["bin/lavish-axi.js", artifact, "--no-open"], lavishEnv);
      const url = output.match(/url:\s*"([^"]+)"/)?.[1];
      assert.ok(url, output);
      browser.emulate("1440x1000x1");
      browser.open(url);
      const { evaluate, wait, emulate } = browser;

      evaluate(`() => {
        const frame = document.getElementById("artifact");
        window.__artifactThemeProbe = null;
        window.addEventListener("message", (event) => {
          if (event.source === frame.contentWindow && event.data?.type === "lavish-test:theme-probe")
            window.__artifactThemeProbe = event.data;
        });
        return "ready";
      }`);
      wait(300);

      const theme = evaluate(`() => {
        const style = (selector) => getComputedStyle(document.querySelector(selector));
        const frame = document.getElementById("artifact");
        return JSON.stringify({
          bodyBg: style("body").backgroundColor,
          bodyFg: style("body").color,
          bodyFont: style("body").fontFamily,
          panelBg: style("#panel").backgroundColor,
          toggleColor: style("#panelToggle").color,
          toggleBorder: style("#panelToggle").borderColor,
          sendBg: style("#send").backgroundColor,
          danger: style("#sendAndEnd").color,
          frameBg: style(".frame").backgroundColor,
          monoFont: style("#panelSummary").fontFamily,
          artifactProbe: window.__artifactThemeProbe,
          frameRightClosed: Math.round(frame.getBoundingClientRect().right),
          radii: ["#panel", "#send", "#chatInput"].map((selector) => style(selector).borderRadius),
          shadows: ["#panel", "#send", "#chatInput"].map((selector) => style(selector).boxShadow),
        });
      }`);
      assert.equal(theme.bodyBg, "rgb(0, 0, 0)");
      assert.equal(theme.bodyFg, "rgb(248, 244, 235)");
      assert.match(theme.bodyFont, /^Archivo/);
      assert.equal(theme.panelBg, "rgb(8, 8, 8)");
      assert.equal(theme.toggleColor, "rgb(111, 199, 194)");
      assert.equal(theme.toggleBorder, "rgb(120, 120, 120)");
      assert.equal(theme.sendBg, "rgb(111, 199, 194)");
      assert.equal(theme.danger, "rgb(248, 113, 113)");
      assert.equal(theme.frameBg, "rgb(255, 255, 255)");
      assert.match(theme.monoFont, /^"?IBM Plex Mono/);
      assert.deepEqual(theme.artifactProbe, {
        type: "lavish-test:theme-probe",
        background: "rgb(37, 51, 68)",
        color: "rgb(237, 226, 201)",
      });
      assert.ok(theme.radii.every((value) => parseFloat(value) <= 3));
      assert.ok(theme.shadows.every((value) => value === "none"));

      evaluate('() => { document.getElementById("panelToggle").click(); return "opened"; }');
      wait(300);
      const probeAfterOpen = evaluate("() => JSON.stringify(window.__artifactThemeProbe)");
      assert.deepEqual(probeAfterOpen, theme.artifactProbe);
      const focus = evaluate(`() => {
        const toggle = document.getElementById("panelToggle");
        toggle.focus();
        const style = getComputedStyle(toggle);
        return JSON.stringify({ color: style.outlineColor, width: style.outlineWidth });
      }`);
      assert.deepEqual(focus, { color: "rgb(111, 199, 194)", width: "2px" });

      for (const [tone, expected, short, label] of [
        ["pending", "rgb(242, 193, 78)", "2", "2 queued"],
        ["feedback", "rgb(255, 179, 134)", "!", "Reply waiting"],
        ["risk", "rgb(248, 113, 113)", "×", "Session ended"],
        ["activity", "rgb(111, 199, 194)", "●", "Agent listening"],
      ]) {
        const state = evaluate(`() => {
          const el = document.getElementById("panelSummary");
          el.className = "panel-summary is-${tone}";
          el.dataset.short = ${JSON.stringify(short)};
          el.textContent = ${JSON.stringify(label)};
          return JSON.stringify({ color: getComputedStyle(el).color, short: el.dataset.short, label: el.textContent });
        }`);
        assert.deepEqual(state, { color: expected, short, label });
      }

      emulate("390x844x3,mobile,touch");
      wait(300);
      const mobileFrameBg = evaluate('() => getComputedStyle(document.querySelector(".frame")).backgroundColor');
      assert.equal(mobileFrameBg, "rgb(255, 255, 255)");
    } finally {
      try {
        run(process.execPath, ["bin/lavish-axi.js", "stop", "--port", String(port)], lavishEnv, 15_000);
      } finally {
        try {
          browser.stop();
        } finally {
          await rm(temp, { recursive: true, force: true });
        }
      }
    }
  },
);
