import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { installLocal, localInstallSteps, runLocalCommand } from "../src/local-install.js";

test("local install uses portable package-manager commands on Windows", () => {
  assert.deepEqual(
    localInstallSteps("win32").map(({ command }) => command),
    ["pnpm", "pnpm", "npm"],
  );
});

test("local install asks the Windows command shell to resolve package-manager shims", () => {
  const calls = [];
  const result = runLocalCommand(
    "pnpm",
    ["install", "--frozen-lockfile"],
    { cwd: "C:\\atlas-core", stdio: "inherit" },
    {
      platform: "win32",
      spawn(command, args, options) {
        calls.push({ command, args, options });
        return { status: 0 };
      },
    },
  );

  assert.deepEqual(result, { status: 0 });
  assert.deepEqual(calls, [
    {
      command: "pnpm",
      args: ["install", "--frozen-lockfile"],
      options: { cwd: "C:\\atlas-core", stdio: "inherit", shell: true },
    },
  ]);
});

test("local install builds this clone and installs Atlas Core for the machine, Codex, and Muse", async () => {
  const home = await mkdtemp(path.join(os.tmpdir(), "atlas-core-install-"));
  const projectRoot = fileURLToPath(new URL("..", import.meta.url));
  const calls = [];
  test.after(() => rm(home, { recursive: true, force: true }));

  await installLocal({
    home,
    projectRoot,
    run(command, args, options) {
      calls.push({ command, args, cwd: options.cwd });
      return { status: 0 };
    },
    log() {},
  });

  assert.deepEqual(calls, [
    { command: "pnpm", args: ["install", "--frozen-lockfile"], cwd: projectRoot },
    { command: "pnpm", args: ["run", "build"], cwd: projectRoot },
    {
      command: "npm",
      args: ["install", "--global", "--ignore-scripts", "--install-links", "."],
      cwd: projectRoot,
    },
  ]);
  const sourceSkill = await readFile(path.join(projectRoot, "skills/atlas-core/SKILL.md"), "utf8");
  assert.equal(await readFile(path.join(home, ".agents/skills/atlas-core/SKILL.md"), "utf8"), sourceSkill);
  assert.equal(await readFile(path.join(home, ".config/muse/skills/atlas-core/SKILL.md"), "utf8"), sourceSkill);
  await assert.rejects(readFile(path.join(home, ".agents/skills/lavish/SKILL.md"), "utf8"), /ENOENT/);
  await assert.rejects(readFile(path.join(home, ".config/muse/skills/lavish/SKILL.md"), "utf8"), /ENOENT/);
  assert.doesNotMatch(JSON.stringify(calls.map(({ command, args }) => ({ command, args }))), /lavish/i);
});

test("local install stops before copying skills when a machine install step fails", async () => {
  const home = await mkdtemp(path.join(os.tmpdir(), "atlas-core-install-failure-"));
  const projectRoot = fileURLToPath(new URL("..", import.meta.url));
  test.after(() => rm(home, { recursive: true, force: true }));

  await assert.rejects(
    installLocal({
      home,
      projectRoot,
      run(command, args) {
        return { status: command === "pnpm" && args[0] === "run" ? 9 : 0 };
      },
      log() {},
    }),
    /pnpm run build failed with exit code 9/,
  );

  await assert.rejects(readFile(path.join(home, ".agents/skills/atlas-core/SKILL.md"), "utf8"), /ENOENT/);
});

test("local install reports a missing package manager without copying skills", async () => {
  const home = await mkdtemp(path.join(os.tmpdir(), "atlas-core-install-missing-tool-"));
  const projectRoot = fileURLToPath(new URL("..", import.meta.url));
  test.after(() => rm(home, { recursive: true, force: true }));

  await assert.rejects(
    installLocal({
      home,
      projectRoot,
      run() {
        return { status: null, error: new Error("spawn pnpm ENOENT") };
      },
      log() {},
    }),
    /could not run pnpm: spawn pnpm ENOENT/,
  );

  await assert.rejects(readFile(path.join(home, ".agents/skills/atlas-core/SKILL.md"), "utf8"), /ENOENT/);
});
