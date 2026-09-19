import { cp, mkdir, readFile, rename, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const DEFAULT_PROJECT_ROOT = fileURLToPath(new URL("../", import.meta.url));

/** @typedef {{ status: number | null, error?: Error }} LocalCommandResult */
/** @typedef {(command: string, args: string[], options: import("node:child_process").SpawnSyncOptions) => LocalCommandResult} LocalSpawnSync */

export function localInstallSteps(_platform = process.platform) {
  return [
    { command: "pnpm", label: "pnpm", args: ["install", "--frozen-lockfile"] },
    { command: "pnpm", label: "pnpm", args: ["run", "build"] },
    {
      command: "npm",
      label: "npm",
      args: ["install", "--global", "--ignore-scripts", "--install-links", "."],
    },
  ];
}

export function localSkillTargets(home = os.homedir()) {
  return [
    path.join(home, ".agents", "skills", "atlas-core"),
    path.join(home, ".config", "muse", "skills", "atlas-core"),
  ];
}

/**
 * @param {string} command
 * @param {string[]} args
 * @param {import("node:child_process").SpawnSyncOptions} options
 * @param {{ platform?: NodeJS.Platform, spawn?: LocalSpawnSync }} [runtime]
 * @returns {LocalCommandResult}
 */
export function runLocalCommand(command, args, options, { platform = process.platform, spawn = spawnSync } = {}) {
  const result = spawn(command, args, {
    ...options,
    ...(platform === "win32" ? { shell: true } : {}),
  });
  return {
    status: result.status,
    ...(result.error ? { error: result.error } : {}),
  };
}

async function replaceDirectory(source, target) {
  const staging = `${target}.installing-${process.pid}`;
  await mkdir(path.dirname(target), { recursive: true });
  await rm(staging, { recursive: true, force: true });
  await cp(source, staging, { recursive: true });
  await rm(target, { recursive: true, force: true });
  await rename(staging, target);
}

export async function installLocal({
  projectRoot = DEFAULT_PROJECT_ROOT,
  home = os.homedir(),
  platform = process.platform,
  run = runLocalCommand,
  log = console.log,
} = {}) {
  const skillSource = path.join(projectRoot, "skills", "atlas-core");
  await readFile(path.join(skillSource, "SKILL.md"), "utf8");

  for (const step of localInstallSteps(platform)) {
    const result = run(step.command, step.args, {
      cwd: projectRoot,
      env: process.env,
      stdio: "inherit",
    });
    if (result?.error) {
      throw new Error(`could not run ${step.label}: ${result.error.message}`, { cause: result.error });
    }
    if (result?.status !== 0) {
      throw new Error(`${step.label} ${step.args.join(" ")} failed with exit code ${String(result?.status)}`);
    }
  }

  const targets = localSkillTargets(home);
  for (const target of targets) {
    await replaceDirectory(skillSource, target);
    log(`Installed Atlas Core skill: ${target}`);
  }
  log("Atlas Core is installed. Restart Codex and Muse so they reload the skill.");

  return { command: "atlas-core", skillTargets: targets };
}
