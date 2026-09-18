import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { createChromeDriver, freePort, run } from "./browser-e2e.js";

const runBrowserE2e = process.env.LAVISH_AXI_BROWSER_E2E === "1";

function contrastRatio(foreground, background) {
  const parse = (value) => {
    const channels = value.match(/^rgb\((\d+), (\d+), (\d+)\)$/);
    assert.ok(channels, `expected a computed opaque rgb color, received ${value}`);
    return channels.slice(1).map((channel) => {
      const normalized = Number(channel) / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    });
  };
  const luminance = (rgb) => rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  const [a, b] = [luminance(parse(foreground)), luminance(parse(background))].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

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

      const populated = evaluate(`() => {
        document.getElementById("chatLog").innerHTML = '<div class="bubble user"><small class="sent-label">Sent</small><div class="bubble-text">Sent message stays readable.</div><div class="anchor"><span class="anchor-kind">Element</span><span class="anchor-excerpt">Sent anchor excerpt stays readable.</span></div></div>';
        document.getElementById("queuedLog").innerHTML = '<div class="bubble user queued"><small class="queued-label">Queued <button class="queued-remove" type="button" aria-label="Remove queued prompt">×</button></small><div class="bubble-text">Queued prompt stays readable.</div><div class="anchor"><span class="anchor-kind">Element</span><span class="anchor-excerpt">Queued anchor excerpt stays readable.</span></div></div>';
        document.getElementById("chatAttachments").innerHTML = '<div class="chat-attachment-chip"><span class="chat-attachment-thumb"></span><span class="chat-attachment-copy"><strong>Reference</strong></span><button type="button">Remove</button></div>';
        document.getElementById("warningsWrap").hidden = false;
        document.getElementById("warningsButton").setAttribute("aria-label", "1 layout issue");
        document.getElementById("shareDialog").hidden = false;
        const style = (selector) => getComputedStyle(document.querySelector(selector));
        const text = (selector) => ({ color: style(selector).color, background: style(selector).backgroundColor });
        const rect = (selector) => { const box = document.querySelector(selector).getBoundingClientRect(); return { width: Math.round(box.width), height: Math.round(box.height) }; };
        return JSON.stringify({
          panel: style("#panel").backgroundColor,
          sent: {
            text: text(".bubble.user:not(.queued) .bubble-text"),
            label: text(".sent-label"),
            anchor: text(".bubble.user:not(.queued) .anchor"),
            excerpt: text(".bubble.user:not(.queued) .anchor-excerpt"),
            anchorKind: text(".bubble.user:not(.queued) .anchor-kind"),
            background: style(".bubble.user:not(.queued)").backgroundColor,
          },
          queued: {
            text: text(".bubble.queued .bubble-text"),
            label: text(".queued-label"),
            anchor: text(".bubble.queued .anchor"),
            excerpt: text(".bubble.queued .anchor-excerpt"),
            anchorKind: text(".bubble.queued .anchor-kind"),
          },
          targets: {
            queuedRemove: rect(".queued-remove"),
            attachmentRemove: rect(".chat-attachment-chip button"),
            warnings: rect("#warningsButton"),
            shareClose: rect("#shareClose"),
          },
        });
      }`);
      for (const [name, foreground, background] of [
        ["sent body", populated.sent.text.color, populated.sent.background],
        ["sent label", populated.sent.label.color, populated.sent.background],
        ["sent anchor", populated.sent.anchor.color, populated.sent.background],
        ["sent anchor excerpt", populated.sent.excerpt.color, populated.sent.background],
        ["sent anchor kind", populated.sent.anchorKind.color, populated.sent.anchorKind.background],
        ["queued body", populated.queued.text.color, populated.panel],
        ["queued label", populated.queued.label.color, populated.panel],
        ["queued anchor", populated.queued.anchor.color, populated.panel],
        ["queued anchor excerpt", populated.queued.excerpt.color, populated.panel],
        ["queued anchor kind", populated.queued.anchorKind.color, populated.queued.anchorKind.background],
      ]) {
        assert.ok(
          contrastRatio(foreground, background) >= 4.5,
          `${name} has at least 4.5:1 contrast: ${foreground} over ${background}`,
        );
      }

      emulate("390x844x3,mobile,touch");
      wait(300);
      const mobileFrameBg = evaluate('() => getComputedStyle(document.querySelector(".frame")).backgroundColor');
      assert.equal(mobileFrameBg, "rgb(255, 255, 255)");
      for (const viewport of ["390x844x3,mobile,touch", "1024x768x1,touch"]) {
        emulate(viewport);
        wait(300);
        const targets = evaluate(`() => {
          if (!document.querySelector(".queued-remove")) {
            document.getElementById("queuedLog").innerHTML = '<div class="bubble user queued"><small>Queued <button class="queued-remove" type="button" aria-label="Remove queued prompt">×</button></small><div class="bubble-text">Queued prompt.</div></div>';
            document.getElementById("chatAttachments").innerHTML = '<div class="chat-attachment-chip"><span class="chat-attachment-thumb"></span><span class="chat-attachment-copy"><strong>Reference</strong></span><button type="button">Remove</button></div>';
            document.getElementById("warningsWrap").hidden = false;
            document.getElementById("warningsDrawer").hidden = false;
            document.getElementById("moreMenu").hidden = false;
            document.getElementById("shareDialog").hidden = false;
            document.getElementById("handoffBanner").hidden = false;
            document.getElementById("outdatedBanner").hidden = false;
          }
          const rect = (selector) => { const box = document.querySelector(selector).getBoundingClientRect(); return { width: Math.round(box.width), height: Math.round(box.height) }; };
          return JSON.stringify({
            viewport: { width: innerWidth, height: innerHeight },
            overflow: document.documentElement.scrollWidth - innerWidth,
            targets: {
              annotation: rect("#annotation"),
              more: rect("#moreButton"),
              panelToggle: rect("#panelToggle"),
              chatAttach: rect("#chatAttach"),
              send: rect("#send"),
              sendAndEnd: rect("#sendAndEnd"),
              queuedRemove: rect(".queued-remove"),
              attachmentRemove: rect(".chat-attachment-chip button"),
              warnings: rect("#warningsButton"),
              warningsQueue: rect("#warningsQueueButton"),
              shareClose: rect("#shareClose"),
              shareCancel: rect("#shareCancel"),
              sharePublish: rect("#sharePublish"),
              menuFile: rect("#copyPath"),
              menuReload: rect("#reloadArtifact"),
              menuEnd: rect("#end"),
              handoffTakeover: rect("#handoffTakeover"),
              outdatedReload: rect("#outdatedReload"),
              outdatedDismiss: rect("#outdatedDismiss"),
            },
          });
        }`);
        assert.equal(targets.overflow, 0, `coarse controls do not create horizontal overflow at ${viewport}`);
        for (const [name, target] of Object.entries(targets.targets)) {
          assert.ok(
            target.width >= 44 && target.height >= 44,
            `${name} is at least 44px for a coarse pointer at ${viewport}: ${JSON.stringify(target)}`,
          );
        }
      }
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
