import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function run(command, args, env = {}, timeout = 45_000) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: { ...process.env, ...env },
    encoding: "utf8",
    timeout,
  });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${command} ${args.join(" ")}\n${result.stdout}\n${result.stderr}`);
  return `${result.stdout || ""}${result.stderr || ""}`;
}

export async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen({ port: 0, host: "127.0.0.1" }, () => resolve(undefined));
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("failed to allocate a TCP port");
  await new Promise((resolve) => server.close(() => resolve(undefined)));
  return address.port;
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

export function createChromeDriver({ temp, session, port }) {
  const env = {
    CHROME_DEVTOOLS_AXI_SESSION: session,
    CHROME_DEVTOOLS_AXI_USER_DATA_DIR: path.join(temp, "chrome"),
    ...(port === undefined ? {} : { CHROME_DEVTOOLS_AXI_PORT: String(port) }),
  };
  const command = (args, timeout) => run("chrome-devtools-axi", args, env, timeout);
  let pageSelected = false;

  // chrome-devtools-axi 0.1.34 creates an initial tab without selecting it. Select that tab once
  // before issuing a page command so its initial profile works the same as later navigations.
  function selectInitialPage() {
    if (pageSelected) return;
    const output = command(["pages"]);
    const id = output.match(/^\s*(\d+),.*$/m)?.[1];
    assert.ok(id, `chrome-devtools-axi did not create an initial page\n${output}`);
    command(["selectpage", id]);
    pageSelected = true;
  }

  return {
    env,
    evaluate(expression) {
      selectInitialPage();
      const output = command(["eval", expression]);
      const raw = output.match(/result:\s*("(?:[^"\\]|\\.)*")/s)?.[1];
      assert.ok(raw, output);
      let value = JSON.parse(raw);
      while (typeof value === "string") {
        try {
          value = JSON.parse(value);
        } catch {
          break;
        }
      }
      return value;
    },
    wait(ms) {
      // In 0.1.34 the CLI passes numeric waits through its selector branch and throws
      // "fn is not a function". A local synchronous wait is sufficient between CLI commands.
      sleep(ms);
    },
    emulate(viewport) {
      selectInitialPage();
      command(["emulate", "--viewport", viewport]);
    },
    open(url, settleMs = 4_000) {
      selectInitialPage();
      command(["open", url]);
      sleep(settleMs);
    },
    stop() {
      command(["stop"]);
    },
  };
}
