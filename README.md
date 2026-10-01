<h1 align="center">Atlas Core</h1>
<p align="center">
  <a href="https://github.com/starthings-solutions/atlas-core/actions/workflows/ci.yml"
    ><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/starthings-solutions/atlas-core/ci.yml?style=flat-square&label=ci"
  /></a>
  <a href="https://github.com/starthings-solutions/atlas-core/actions/workflows/release-please.yml"
    ><img alt="Release" src="https://img.shields.io/github/actions/workflow/status/starthings-solutions/atlas-core/release-please.yml?style=flat-square&label=release"
  /></a>
  <a href="https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-blue?style=flat-square"
    ><img alt="Platform" src="https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-blue?style=flat-square"
  /></a>
</p>

<h3 align="center">For when a rich editor is not rich enough.</h3>

<p align="center">
  <img alt="Atlas Core demo" src="atlas-core-marketing/renders/atlas-core-marketing.gif" width="960" />
</p>

HTML is the new markdown. Atlas Core is the new editor for your HTML artifacts.

Agents are good at producing rich HTML artifacts, but the human-agent collaboration loop on such artifacts is lacking and falls back into screenshots and long responses for “tell me what to change.”
That loses the thing HTML is best at: interactivity.

Atlas Core opens agent-generated HTML files in a local browser, lets you pinpoint elements and selected text, edit diagrams your agent authored as Mermaid whiteboards, and send actionable feedback back to the agent.

- **Local-first** - Review local HTML artifacts with a local CLI and no cloud dependency in the core feedback loop; hosted sharing through third-party ht-ml.app is explicit and opt-in.
- **Human-AI collaboration** - Annotate elements and selected text ranges, edit Mermaid whiteboard diagrams, and send messages to the agent without leaving Atlas Core.
- **Batteries included** - Atlas Core teaches your agent good visualization for common use cases such as product or technical plans, design explorations, and more out of the box.

Atlas Core is an [AXI](https://axi.md), which means:

- It is a CLI any capable agent can run after the local installation.
- It is optimized for agent ergonomics, with TOON output, long polling, and contextual disclosure for token-efficient operation.
- The skill and hooks below only handle discovery; agents learn to use the AXI by using it.

## Install

Atlas Core is installed from this repository, not from a package registry. You need Node.js 22 or newer, npm, pnpm, and Git. Clone the repository and run its local installer:

```sh
git clone https://github.com/starthings-solutions/atlas-core.git
cd atlas-core
npm run install:local
```

The installer resolves dependencies, builds the current checkout, installs a standalone `atlas-core` command on this machine, and copies the public `atlas-core` skill into the Codex and Muse skill directories. The installed command is not symlinked back to the checkout. Restart Codex and Muse afterward so they reload the skill.

The public skill stays a short discovery stub and sends the agent to `atlas-core --help`, `atlas-core design`, and `atlas-core playbook` for current instructions. Its frontmatter also includes Hermes Agent metadata so compatible harnesses can categorize it as a productivity skill. The repository-local `atlas-design` skill is an internal brand reference for maintainers and is not part of the public install.

Then, in agents that expose skills as slash commands (Claude Code, for example), invoke it directly:

```
/atlas-core let's discuss our plan here
```

Or just ask for anything that is easier to grasp visually - a plan, comparison, diagram, table, code view, or report - and the agent loads the skill on its own when it recognizes the task.

Use the installed command directly:

```sh
atlas-core --help
atlas-core artifact.html
```

## Update

Update the same checkout, then rerun the local installer:

```sh
cd atlas-core
git pull --ff-only
npm run install:local
```

`atlas-core update` prints these source-update instructions. It never queries or installs Atlas Core from an npm registry; only ordinary dependencies are resolved there by the installer.

## Optional Integrations

### Session hook

Want Atlas Core's ambient context - including your live open sessions - fed into every agent session instead of loading on demand?
After the local installation, opt into the hook:

```sh
atlas-core setup hooks
```

This installs a `SessionStart` hook for **Claude Code**, **Codex**, **OpenCode**, and **GitHub Copilot CLI** that surfaces open sessions, visualization playbooks, and usage guidance at the start of each session.
Unlike the skill, the hook also shows your live open sessions, so a fresh agent session can resume an in-flight review.
**Restart your agent session after running this** so the new hook takes effect.

### Agent Plugin

Atlas Core also ships as an [Agent Plugin](https://agent-plugins.org) - the vendor-neutral packaging standard for skills and MCP servers - so clients that speak that format can load it directly.

**No marketplace is involved.** The machine-local Atlas Core installation is also the plugin: `plugin.json` sits at its root next to the `skills/` directory. After installing from the clone, register it:

```sh
atlas-core setup plugin
```

That registers the installed package with every supported client it finds - **VS Code**, **Cursor**, and **GitHub Copilot CLI** - and reports which ones were absent. It is opt-in and idempotent, and it repairs the registered path after a reinstall or relocation. Reload each client afterward.

Each client is registered independently: one that cannot be registered is reported with what to do about it and never blocks the others or fails the command.

Codex and ChatGPT install plugins only from marketplace sources, so Codex users should use the session hook above instead.
Atlas Core declares no MCP server - the CLI itself is the agent interface - so a plugin install brings the same `atlas-core` skill, and the skill and plugin are alternatives rather than a stack.

## How It Works

```
┌───────────────┐
│ Agent writes  │
│ artifact.html │
└───────┬───────┘
        ▼
┌────────────────────────┐
│ atlas-core <file_path> │
│ opens local browser UI │
└───────┬────────────────┘
        ▼
┌────────────────────────┐
│ Human annotates text   │
│ or elements, sends     │
│ chat, or queues layout │
│ issues from the inbox  │
└───────┬────────────────┘
        ▼
┌────────────────────────┐
│ atlas-core poll waits  │
│ and returns prompts    │
│ the user queued        │
└────────────────────────┘
```

- **File-path identity** - Sessions are keyed by the canonical HTML file path, so agents do not need opaque IDs.
- **Portable artifacts** - The artifact runs in a sandboxed iframe while Atlas Core injects a small SDK for annotations, snapshots, feedback controls, and render-time layout checks.
  Author-defined links and popups can open in top-level tabs, while artifact documents remain sandboxed without same-origin access.
  Atlas Core does not inject any design system, so the saved HTML file renders identically whether you open it through `atlas-core` or directly in a browser.
  Run `atlas-core design` for the single source of agent-facing design guidance, including optional CDN snippets and the whiteboard (Mermaid) opt-in snippet.
- **Self-paint warning** - `atlas-core <html-file>`, `export`, and `share` run a render-free check for artifacts missing an explicit page background and return a one-line `self_paint_warning`.
  The check fails open - any stylesheet link, `@import`, Tailwind runtime script, `color-scheme`, or `html`/`body`/`:root` background signal suppresses it - and it never blocks the open.
- **Open-time layout gate** - The browser chrome masks an artifact only while the real in-iframe audit waits for fonts and final geometry.
  The first completed client-side check reveals the artifact, whatever it found and even if reporting that check to the server fails; the gate never holds the review hostage waiting for a repair or a network round-trip.
  The user can click **Show anyway**, and a bounded safety timeout fails open from every gate state.
  If the review cannot load at all - the chrome's own script never runs, or the server does not answer the artifact's load request after several retries - the mask names the problem and offers **Check and reload** without removing the independent **Show anyway** escape.
  A review already loaded in another browser tab is named the same way, with a **Take over here** button that moves it into the current tab, because Atlas Core loads an artifact in one tab at a time.
- **Layout issues inbox** - Detection is passive. After fonts and finite animations settle, the injected SDK confirms severe failures from direct rendered evidence such as materially escaped meaningful content or required controls, clipped text fragments, viewport reachability, or near-total semantic occlusion.
  Explicit ellipsis and line clamp, standard visually hidden accessibility text, intentional scrollers or masks, parent overhang, generic element scroll geometry, decorative overlap, and uncertain motion do not produce findings by themselves.
  Proven failures are filed in a **Layout issues** button in the top bar, which is hidden while nothing is unresolved and otherwise shows the unresolved count.
  Its drawer lists each issue with severity, a plain-language explanation, the affected viewport, the target/component identity, when it was last seen, and its lifecycle state, plus per-issue **Reveal** (highlight it in the artifact) and **Dismiss** actions.
  Nothing is selected by default. The user picks issues (or **Select all**) and **Queue selected fixes** turns that whole group into one ordinary queued prompt, tagged `layout-warnings`, that reaches the agent through the normal feedback path when they send.
  Detection never returns `atlas-core poll` and never wakes an agent; only the user queueing a fix does. The one exception is a fatal `artifact_failures` response, for failures that make the review itself unusable, such as the artifact document or one of its own local assets failing to load.
- **Layout issue lifecycle** - Each issue is identified by a stable fingerprint of the diagnostic rule, the normalized target identity, and the viewport class, so repeat detections update one record instead of inflating the count.
  `Open` means the latest completed check for its viewport still detects it. `Queued for fix` means the user asked for a repair - it stays unresolved and counted, and cannot be queued again while that request is outstanding.
  `Resolved` requires a newer successful artifact load plus a complete check at the same viewport that no longer detects it; it then leaves the count but keeps a bounded history.
  `Still present` (recurring) means a queued issue survived a newer revision, so it is selectable again with its earlier attempt retained. `Unverified` means a reload or check failed or was incomplete, so the prior issue was preserved rather than cleared. `Returned` means a resolved issue came back on a later revision.
  Dismissal applies only to the current artifact revision; a later revision surfaces the issue again if it is still detected. A check at one viewport never clears an issue found at another, and a viewport removed from the configured diagnostic set (`ATLAS_CORE_DIAGNOSTIC_VIEWPORTS`, default all) is marked obsolete with an explicit reason rather than reading as fixed.
- **Local assets** - Copy local images, CSS, fonts, and scripts next to the HTML artifact and reference them with relative paths from that directory; root-prefixed paths such as `/assets/logo.png` will not resolve through Atlas Core's artifact route.
- **Export and sharing** - `atlas-core export` writes `<name>.export.html` by inlining local assets only, stripping the annotation SDK, and leaving remote CDN/font references as links that still need network access.
  `atlas-core share` publishes the same local-inlined HTML to [ht-ml.app](https://ht-ml.app), a third-party hosting service not part of Atlas Core.
  Publishing sends the artifact to ht-ml.app's servers, public by default, or private and password-protected with `--private` (Atlas Core generates the password and returns it once, in the command output and in the browser publish dialog) or `--password <pw>` (one you supply, never echoed back). A generated password is a shared secret: give it to whoever should read the page, and expect it to appear in your agent's transcript, because the agent has to relay it. Atlas Core does not store it.
  The response includes a secret `update_key` shown once. Keep it to republish the same URL later with `--site <site_id> --update-key <key>`, which replaces the HTML in place and leaves the password alone unless you pass `--private` (rotate to a new generated one) or `--password <pw>` (set one). Locking a page that was public is not instant - it can keep answering from ht-ml.app's CDN cache for minutes after the password is set - while a page that was already private has no such cached copy.
  A page's password cannot be removed: ht-ml.app accepts a request to clear one and silently ignores it, so Atlas Core offers no way to make a private page public rather than telling you it did something the host did not do. Republish as a new page if you need a public URL.
  ht-ml.app has no delete endpoint, so `--unpublish --site <site_id> --update-key <key>` replaces the page with a short placeholder and locks it behind a discarded random password rather than removing it: the URL still resolves and the host still holds what was published. The content swap is immediate, but the lock is not: a page that was public can keep serving the placeholder to uncredentialed visitors from ht-ml.app's CDN cache for minutes afterwards. The `update_key` plus `--private` republishes real content behind a new password you can share.
  Bundling never fetches remote URLs, Atlas Core itself does not set a CSP, local reads stay confined and size-capped, and absolute `file://` paths outside safe inlined asset references are redacted before output.
  Per-asset and per-bundle inline caps default to 10 MB and 25 MB, overridable with `ATLAS_CORE_EXPORT_MAX_ASSET_BYTES` and `ATLAS_CORE_EXPORT_MAX_BUNDLE_BYTES`.
  Unresolved local assets or export notices such as author-set CSP meta tags and redacted file URLs are surfaced in command or browser output.
  Use `--token` or `ATLAS_CORE_HTML_APP_TOKEN` for an optional bearer token when publishing a new page (a republish or `--unpublish` authorizes with the `update_key` instead and rejects `--token`); set `ATLAS_CORE_HTML_APP_API_URL` to override the ht-ml.app API base and point `share` at a backend you control (see [Self-hosting the share backend](docs/self-hosting-share.md) for the contract it must implement).
- **Live reload** - Atlas Core watches the HTML artifact file by default and preserves review context across reloads: the artifact iframe scroll position, an open annotation card's unsent text, and answers to `data-atlas-question` controls (application-owned form state is left alone). Unsent annotation text also survives a full reload of the review page itself. While a queued layout-issue batch is outstanding, closely spaced saves coalesce so one batch of fixes costs one refresh. To also reload on sibling asset changes, add `data-atlas-live-reload-root` to the root element or `<meta name="atlas-live-reload" content="root">`.
  If the element an unsent annotation was attached to is gone from the artifact for good, Atlas Core cannot reopen that card, so it writes your text into the conversation panel under **Unsent annotation** - selectable, never written over anything you have typed, and kept there across reloads; no note is ever dropped to make room for a newer one, and a note the browser refuses to store says so where it is shown.
- **Feedback controls** - Native controls (radios, checkboxes, inputs, selects, buttons, labels, disclosure summaries, contenteditable) are interactive automatically, so they do not need `data-atlas-action`.
  For reversible choices, let option clicks update local state, then queue exactly one final answer from a per-question submit or Queue answer button with `window.atlas.queuePrompt()`.
  Mark only custom (non-native) clickable elements with `data-atlas-action` so Atlas Core does not annotate them, and use `data-atlas-question` or `queueKey` when pre-send updates for the same question should replace each other.
  Everything you send is part of the conversation: a note on an element, a text selection, a table cell, a diagram node, a whiteboard, a layout-issue batch, or a composer message each becomes a bubble on your side of the Conversation panel, with an anchor line naming what it was attached to (the element tag, text selection, table cell, diagram node, whiteboard, or layout issues), a quoted excerpt, and, when available, the selector on hover. A note you have queued but not sent sits at the end of the conversation as a dashed bubble labelled **Queued** with a remove control; while its batch is in flight it reads **Sending**, and once the server accepts it, it settles in place as a sent bubble in every tab of the session. The panel keeps the newest stored transcript up to 5 MiB; older bubbles drop from view, but an accepted note still settles and is not sent twice. Agent replies render a small Markdown subset - paragraphs, line breaks, headings as bold lead lines, bullet and numbered lists, fenced and inline code, bold, italic, and http(s) links - while tables, images, and raw HTML stay as the text the agent wrote; your own messages keep their line breaks and are never parsed.
  On wider screens, the conversation and the queued notes share one scrollable Conversation panel above a sticky composer, so long feedback queues do not push the text box or send controls off screen.
  The browser chrome keeps editing actions in the overflow menu (copy path, reload artifact, copy DOM snapshot, export standalone HTML, publish link, end session), while the composer exposes **Send & End** beside **Send to Agent** to submit queued prompts and user-ended attribution together. Once **Send & End** starts, Atlas Core pauses new feedback, waits up to 5 seconds for feedback preparation already underway, keeps any open annotation draft intact until delivery succeeds, then holds that exact terminal batch. A completed reservation survives a page reload, including when its prompts were already delivered and only the pending end remains; incomplete preparation is not restored. If preparation times out, Atlas Core keeps the review open and its existing queue editable with a visible error. A transient delivery failure permits only retrying the same terminal batch through **Send & End** until it succeeds. If a snapshot makes the request too large (HTTP 413), Atlas Core retries that exact batch once without the optional snapshot. An actionable attachment rejection (HTTP 400), recoverable layout-selection conflict (HTTP 409), or unrecoverable 413 instead cancels the terminal reservation without ending the session, keeps the prompts queued, and restores editing, removal, **Send to Agent**, **Send & End**, and **End session** so the reviewer can revise or remove stale feedback before submitting again.
  Composer feedback is visibly queued before the text box clears and stays queued until acknowledged. Send waits up to 5 seconds for the artifact's DOM snapshot, then delivers without that optional context if the frame no longer answers; a late snapshot cannot submit the batch twice. A failed or still-unacknowledged POST keeps the queue and shows persistent recovery guidance unless a transcript sync proves the server already accepted that feedback.
- **Reviewing on a phone** - Below 860px wide, the artifact takes the whole screen above a **Conversation** dock, and the conversation opens as a bottom sheet over it: tap the dock, swipe it up, or press the chevron to raise it; tap the dimmed artifact, swipe the sheet down, press the chevron, or press Escape to lower it. The dock reports what matters while the sheet is down - how many prompts are queued, a reply that arrived while you were reading, or whether the agent is listening - and the sheet stays open across a reload of the review page. The sheet sizes itself to the visible viewport and respects safe-area insets; if the keyboard or attachments leave little room, conversation content yields or scrolls while the send actions remain pinned above the bottom edge. In landscape the sheet covers the top bar as well. On wider screens the conversation starts collapsed so the artifact owns the viewport, and a **Conversation** toggle in the top bar reopens it side-by-side: opening focuses the composer, closing (or Escape with focus in the panel) returns focus to the toggle, and the open state survives a page reload. An agent reply lights an unread dot on the toggle but never opens the panel on its own.
- **Keyboard shortcuts** - In the chrome composer, Enter sends queued prompts and Shift+Enter inserts a newline.
  In the annotation card, Enter queues the annotation, Shift+Enter inserts a newline, and Ctrl+Enter (Cmd+Enter on macOS) queues it and sends all queued prompts immediately. Escape closes the card, same as Cancel, but only while it is empty (no text, no attachment); with unsent text or an attachment present, Escape does nothing rather than risk discarding it.
  Cmd+I or Ctrl+I toggles between annotate and explore mode from either the browser chrome or the artifact iframe, including while focus is in a textarea or control.
- **Agent presence** - The browser shows when no agent is listening, keeps queued feedback for the next successful `atlas-core poll` send even across reloads, and keeps human feedback actions available while the agent is working because the server queues them for the next poll. An agent reply concludes delivered work and returns presence to waiting.
  In a Herdr-managed pane, set `ATLAS_CORE_HERDR_CHIME=1` to show a Herdr request notification and play its chime once an indefinite poll enters the waiting state. Immediate queued feedback and timed debug polls do not trigger a notification. The integration is off unless both `ATLAS_CORE_HERDR_CHIME` and Herdr's `HERDR_ENV` session marker equal `1`; leaving either unset or using any other value opts out. Notification delivery runs without blocking feedback: if Herdr is unavailable, rejects the notification, stalls, or fails, the poll continues unchanged.
  Closing the last review tab while a poll is active starts a 10-second reconnect grace period. A reload or quick reconnect keeps an active poll waiting; if every review stays disconnected, the poll returns `browser_disconnected` without ending the resumable session, and the agent asks whether to reopen or end it instead of acting uninvited.
  The no-timeout poll always writes an immediate stderr banner so it is visibly not hung; it adds the periodic stderr wait ticks only in an interactive terminal, so when stderr is piped (as under agent harnesses) the captured output carries no tick noise. Stdout always stays reserved for the final response; if the poll is interrupted or times out before feedback arrives, re-run it because feedback remains queued until delivery. Poll delivery consumes the response, so read the complete response before truncating or filtering it.
  Codex-specific guidance keeps that poll attached to the active turn instead of hiding it in a background task, because completed background tasks may not resume the agent.
- **Session end etiquette** - Atlas Core tracks who ended a session: a human clicking **End session** (or **Send & End**) in the browser is a user-initiated end, while `atlas-core end <html-file>` is agent-initiated.
  When either side ends the session, every open review tab becomes visibly read-only and disables its feedback controls; feedback submitted after the end is refused instead of being accepted without an agent to receive it.
  A plain `atlas-core <html-file>` after a user-initiated end refuses to reopen the browser and returns guidance instead; pass `--reopen` only when the user asks for further review or something important needs their visual attention.
  Agent-initiated ends keep reopening normally, same as before.
  `atlas-core poll`'s `ended` response and the `feedback` response for the final batch before an end both carry `next_step` guidance telling the agent to stop polling and deliver remaining updates in chat instead of reopening.
- **Precise targets** - Text annotations include selected text plus range anchors, and text selections carry those anchors only.
  Clicking an element inside a table also carries the cell's visible row and column names alongside the exact CSS locator, so filtered or sorted rows do not make feedback look misdirected.
  When merged cells make either name ambiguous, Atlas Core leaves that name out rather than guessing; an explicit `<th scope="row">` remains authoritative even when a `rowspan` makes the row's position ambiguous.
  The CSS locator still points at the exact element you clicked, so an annotation with an omitted name is only less descriptive, never mislabelled.
- **Image attachments** - Attach reference images (PNG, JPEG, WebP) in either the Conversation composer or an annotation card by pasting, drag-dropping, or using its image picker; each image shows a thumbnail chip with upload, remove, retry, and error states. If a sent image is later evicted under the attachment storage limits, its transcript-history thumbnail becomes an **Image expired** placeholder.
  A paste containing both text and images preserves the text while attaching the images (a copied file's own name or path is treated as placeholder and not pasted). Conversation messages may contain text and images together or images only.
  Images are stored under the state dir and the queued prompt carries a server-generated absolute `path` and content-hash `id` (plus mime and dimensions) - never the raw bytes - so `atlas-core poll` hands the agent a local file path to open.
  Limits are `ATLAS_CORE_MAX_ATTACHMENT_BYTES` (default 10 MiB per image), `ATLAS_CORE_MAX_ATTACHMENTS_PER_PROMPT` (default 4), and `ATLAS_CORE_MAX_PROMPT_ATTACHMENT_BYTES` (default 25 MiB per prompt); if any image is missing or any prompt breaches a count or byte cap, the entire send batch is rejected, the queue is preserved, and the reason is surfaced in the composer rather than silently dropping images.
  As a browser-side abuse guard, each chrome page allows 30 upload attempts per rolling minute, 4 uploads in flight at once, and 256 MiB of attempted image bytes over its lifetime; rejected uploads stay visible for retry or removal.
  Attachments are cleaned up by `ATLAS_CORE_ATTACHMENT_TTL_MS` (default 7 days; `0`/`off` disables) but only once no pending prompt still references them; `ATLAS_CORE_MAX_ATTACHMENT_DISK_MB` (default 512 MiB; `0`/`off` disables) caps total attachment disk.
  The cap is enforced when an image is uploaded, not just periodically: the upload first reclaims unreferenced files (oldest first, and never one added within the last hour), and if it still would not fit, that upload is refused with a storage-full error on its chip instead of discarding an image the user is about to send.
- **Mermaid diagrams** - Whiteboards are an opt-in: agents author a diagram as Mermaid only when you ask for an editable whiteboard, and hand-authored inline SVG illustrations are the default figure medium otherwise.
  In the Atlas Core browser, every rendered Mermaid diagram in a `.mermaid` container becomes an embedded editable Excalidraw whiteboard.
  Click a diagram to unlock editing, and use its Fullscreen action to edit it over the whole viewport.
  Whiteboard scenes autosave locally.
  If a live reload changes the Mermaid source, an unmodified whiteboard silently re-converts to the new diagram. If the reviewer had edited the scene, reopening it lets them re-convert and discard the saved edits or keep editing the saved scene.
  Use **Queue feedback** to add a bounded edit summary plus local `.excalidraw` scene and PNG preview paths to the Conversation panel, then click **Send to Agent** to deliver it.
  The agent updates the artifact's Mermaid source, which remains authoritative.
  Flowchart, sequence, class, ER, and state diagrams convert to editable shapes; other diagram types are images that reviewers can draw and annotate.
  Atlas Core changes only the browser view, so saved, standalone, and exported artifacts still render plain Mermaid.
- **Server cleanup** - The detached server stops after the last session ends when nothing is connected, or after `ATLAS_CORE_IDLE_TIMEOUT_MS` (default 30 minutes) with no browser or poll connections.
  Set `ATLAS_CORE_IDLE_TIMEOUT_MS=0` or `off` to disable idle self-shutdown.
- **Server upgrades** - One background server serves every session, so upgrading `atlas-core` while reviews are open makes the next `atlas-core <html-file>` replace that server. Only the review page for the artifact being opened reloads itself once the replacement answers - and not even that one while you have unsent annotation text open, which gets the same banner instead so the reload is yours to make. Every other open review page keeps working and shows a banner reading "Atlas Core was updated. This page is running the previous version.", with a Check and reload button and a Dismiss button, so no page you are reading reloads on its own. After `atlas-core stop` those pages say Atlas Core was stopped and to reload after you start it again, and a restart that only picks up a local build says that rather than claiming an update. An open review page whose server simply goes away - idle self-shutdown, a crash, a machine that slept - shows that same banner once reconnecting has failed for a few seconds, rather than retrying a dead server silently while looking fine; it clears itself if the server comes back, and dismissing it keeps it dismissed until then.
  A page still using the legacy event stream reloads once when it reconnects to the replacement server, moving itself onto the current transport without retaining an HTTP connection. If unsent annotation text is open, it shows the neutral server-restarted banner instead and waits for you to reload.
  Every **Check and reload** control asks the server whether it is running before it navigates; while nothing answers, the page stays where it is and says so, and a check that gets no answer at all says that instead of guessing.
  In-flight `atlas-core poll` commands end with an interrupted-poll error and are safe to re-run; queued feedback is never lost, and annotation text you have typed but not queued yet survives the reload as described under **Live reload**.
  A page waits for the replacement rather than reloading into a port nothing is listening on, and tells the user to restart Atlas Core if it never returns.
- **Local-first state** - Session state stays under `~/.atlas-core/` by default, or `ATLAS_CORE_STATE_DIR` when set.
- **Diagnostic viewports** - `ATLAS_CORE_DIAGNOSTIC_VIEWPORTS` sets which viewport classes the layout-issue inbox tracks (`mobile`, `compact`, `desktop`; comma-separated, default all). Warnings whose class leaves the set are marked obsolete with an explicit reason instead of silently reading as fixed.
- **Server port** - Set `ATLAS_CORE_PORT` to choose the server port; it defaults to `4397`.
- **Network binding** - With Tailscale running, the review server automatically listens only on loopback (`127.0.0.1`) and this machine's Tailscale IPv4 address - never on `0.0.0.0` or every interface. The generated session link uses the machine's MagicDNS name, so it is the phone-ready URL to open from another device on the same tailnet. When Tailscale is absent or down, Atlas Core silently falls back to loopback-only and prints no phone URL. If Tailscale is running but MagicDNS is unavailable or its address cannot be bound after brief retries, Atlas Core visibly warns that phone access is unavailable and remains loopback-only. Binding beyond loopback exposes an unauthenticated server that can read and serve arbitrary local files to devices that can reach it, so the tailnet should be trusted. Any explicit `ATLAS_CORE_HOST` overrides automatic Tailscale binding; wildcard values are restricted to loopback, while a non-wildcard value selects that one concrete bind address. Each address is retried briefly, and if none can be bound Atlas Core falls back to loopback, warns that it is not reachable at the requested address, and points session links at loopback unless `ATLAS_CORE_LINK_HOST` explicitly overrides them - a locally reachable server beats no server at all. When an unavailable requested address returns, the next CLI invocation restarts the fallback server once to restore that listener. `ATLAS_CORE_LINK_HOST` controls the link host when automatic Tailscale binding is disabled.
- **Allowed hosts** - To defend against DNS rebinding, the server rejects (`403`) any request whose `Host` header is missing or not one it answers to: loopback names plus the concrete Tailscale IPv4 address and MagicDNS name when the Tailscale listener is successfully bound. If you configure a reverse proxy or another intentional hostname, list it in `ATLAS_CORE_ALLOWED_HOSTS` (whitespace-separated). Behind a reverse proxy, the forwarded `X-Forwarded-Host` is validated against the same list, so add the public hostname there and have the proxy send it together with `X-Forwarded-Proto`. Set `ATLAS_CORE_ALLOWED_HOSTS` to `*` to disable the check entirely, only when the server sits behind your own authentication or proxy. Mutating routes also reject a present foreign `Origin` or `Referer` (`403`); header-less CLI control requests remain allowed where supported.
- **Browser opening** - Set `ATLAS_CORE_NO_OPEN=1`, equivalent to `--no-open`, to create or resume a session without launching a browser window.

## CLI Reference

| Command                         | Description                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `atlas-core`                    | Show current sessions and usage guidance.                                                                                                                                                                                                                                                                                                                     |
| `atlas-core update`             | Print the source-update instructions (`git pull --ff-only` plus `npm run install:local` from the clone); Atlas Core itself never updates through an npm registry. `--check`/`--dry-run` print the same guidance without changing anything.                                                                                                                    |
| `atlas-core <html-file>`        | Open or resume an Atlas Core session, with the open-time layout gate enabled by default. Unresolved layout issues from earlier in the session are preserved. Refuses to reopen a session the user explicitly ended from the browser unless `--reopen` is passed.                                                                                              |
| `atlas-core poll <html-file>`   | Long-poll until the user sends feedback, ends the session, or leaves every review disconnected past the reconnect grace period; detected layout issues arrive only when queued. On `browser_disconnected`, ask before reopening or ending the still-resumable session. On `ended`, stop polling and do not reopen uninvited.                                  |
| `atlas-core end <html-file>`    | End a session as the agent; unlike a user-initiated end from the browser, this still allows a plain reopen later.                                                                                                                                                                                                                                             |
| `atlas-core export <html-file>` | Write a portable copy of the artifact: one HTML file with its local assets inlined, so it opens with no server and no sibling files. Remote CDN/font references are left as links.                                                                                                                                                                            |
| `atlas-core share <html-file>`  | Publish the artifact (local assets inlined) to [ht-ml.app](https://ht-ml.app), a third-party host not part of Atlas Core, and print a visitable URL plus a secret update key; shares are public by default, `--private` locks one behind a generated password, and the same command republishes or unpublishes an existing page with `--site`/`--update-key`. |
| `atlas-core stop`               | Shut down the background server.                                                                                                                                                                                                                                                                                                                              |
| `atlas-core playbook [id]`      | List focused artifact guidance or show one playbook; agents must open each matching playbook before writing HTML.                                                                                                                                                                                                                                             |
| `atlas-core design`             | Show agent-facing design guidance: the Atlas Core OLED default (fonts + `atlas-core-oled` theme head snippet), the Tailwind/DaisyUI CDN snippet, the whiteboard (Mermaid) opt-in snippet, and component reference. New artifacts use OLED unless explicitly directed otherwise.                                                                               |
| `atlas-core setup hooks`        | Install or repair optional SessionStart hooks for Claude Code, Codex, OpenCode, and GitHub Copilot CLI; restart the agent session afterward.                                                                                                                                                                                                                  |
| `atlas-core setup plugin`       | Register the installed package as an [Agent Plugin](https://agent-plugins.org) in VS Code, Cursor, and GitHub Copilot CLI; opt-in, idempotent, no marketplace involved. Reload each client afterward.                                                                                                                                                         |
| `atlas-core server`             | Run the local Atlas Core server.                                                                                                                                                                                                                                                                                                                              |

Known playbook IDs: `diagram`, `table`, `comparison`, `plan`, `code`, `input`, `explanation`, `slides`.
One artifact often combines several playbooks, such as a plan that includes a comparison and a diagram, so agents must match against each `use_when` trigger and open every matching playbook before writing HTML.
For flows, architecture, state, or sequence diagrams, open the diagram playbook for the recommended tooling and SVG guidance.

### Flags

| Command                  | Flag                        | Description                                                                                                                                                                                                                                                                                                                   |
| ------------------------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `atlas-core <html-file>` | `--no-open`                 | Ensure the server/session exists without opening another browser window.                                                                                                                                                                                                                                                      |
| `atlas-core <html-file>` | `--no-gate`                 | Skip the open-time layout curtain for this browser open.                                                                                                                                                                                                                                                                      |
| `atlas-core <html-file>` | `--reopen`                  | Reopen a session the user explicitly ended from the browser; without it, a plain open refuses and explains why instead of reopening uninvited.                                                                                                                                                                                |
| `atlas-core update`      | `--check`                   | Report current vs latest npm version without installing an update.                                                                                                                                                                                                                                                            |
| `atlas-core export`      | `--out <path>`              | Write the export to a specific path instead of `<name>.export.html` next to the source.                                                                                                                                                                                                                                       |
| `atlas-core share`       | `--private`                 | Make the page private behind a password Atlas Core generates and returns once; hand it to viewers as a shared secret.                                                                                                                                                                                                         |
| `atlas-core share`       | `--password <pw>`           | Make the third-party ht-ml.app page private with a password you supply; viewers must supply the password. An empty or whitespace-only value (an unquoted `$PW` that is unset) is refused rather than publishing a public page.                                                                                                |
| `atlas-core share`       | `--site <site_id>`          | Republish an existing page in place (with `--update-key`) instead of creating a new one; the URL does not change.                                                                                                                                                                                                             |
| `atlas-core share`       | `--update-key <key>`        | The secret returned when the page was published; required to republish or unpublish it.                                                                                                                                                                                                                                       |
| `atlas-core share`       | `--unpublish`               | Replace a published page with a locked placeholder (ht-ml.app cannot delete); takes `--site` and `--update-key` and no file.                                                                                                                                                                                                  |
| `atlas-core share`       | `--token <t>`               | Attach an optional bearer token (`ATLAS_CORE_HTML_APP_TOKEN`) when creating a page; never required, and rejected on a republish or `--unpublish`, where the `update_key` is the credential.                                                                                                                                   |
| `atlas-core poll`        | `--agent-reply "..."`       | Show a concise agent reply in the existing browser chat, conclude delivered work, and return presence to waiting before polling again. Keep replies concise by default.                                                                                                                                                       |
| `atlas-core poll`        | `--agent-reply-file <path>` | When a longer reply is genuinely necessary, read Markdown from a file (`-` for stdin) so newlines survive quoting. Use blank-line paragraphs, `- ` / `1. ` lists, and `## ` headings so the Conversation panel renders it scannably. The Markdown subset is under Feedback controls. Cannot be combined with `--agent-reply`. |
| `atlas-core poll`        | `--timeout-ms <ms>`         | Test/debug escape hatch only; agents should normally omit it and leave the long poll running.                                                                                                                                                                                                                                 |
| `atlas-core stop`        | `--port <port>`             | Shut down a server running on a non-default port.                                                                                                                                                                                                                                                                             |
| `atlas-core server`      | `--verbose`                 | Log session and watcher events to stderr; can also be enabled with `ATLAS_CORE_DEBUG=1`. Detached server output is appended with UTC timestamps to `~/.atlas-core/server.log` (or `ATLAS_CORE_STATE_DIR/server.log`) for startup, shutdown-cause, and crash diagnostics.                                                      |

## Development

```sh
pnpm run check          # Run all verification commands
pnpm run build          # Bundle the publishable CLI, chrome, and design assets
pnpm run build:skill    # Regenerate the installable atlas skill
pnpm test               # Run node:test tests
pnpm run lint           # Run ESLint
pnpm run format:check   # Check Prettier formatting
pnpm run typecheck      # Run TypeScript checkJs validation
```
