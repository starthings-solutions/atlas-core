import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("check script runs all verification commands", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const checkCommands = packageJson.scripts.check.split(" && ");

  assert.deepEqual(checkCommands, [
    "npm run build",
    "npm run lint",
    "npm run format:check",
    "npm run typecheck",
    "npm test",
    "node scripts/build-skill.js --check",
    "node scripts/build-plugin.js --check",
  ]);
});

test("committed Atlas Core skill matches the generator stub", async () => {
  const { createSkillMarkdown } = await import("../src/skill.js");
  const committed = await readFile(new URL("../skills/atlas-core/SKILL.md", import.meta.url), "utf8");

  assert.equal(committed, createSkillMarkdown(), "run `npm run build:skill` and commit the result");
});

test("source distribution includes the installable skill", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

  assert.ok(packageJson.files.includes("skills/atlas-core"));
});

test("source distribution root is a complete Agent Plugin", async () => {
  // The cloned repository doubles as the plugin root, so both the manifest and the skills it
  // discovers must remain part of the local installation surface.
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

  assert.ok(packageJson.files.includes("plugin.json"));
  assert.ok(packageJson.files.includes("skills/atlas-core"));
});

test("release-please keeps the plugin manifest version in step with the package", async () => {
  const config = JSON.parse(await readFile(new URL("../release-please-config.json", import.meta.url), "utf8"));

  assert.equal(config["bootstrap-sha"], "d62853166c21dde6f9e8a0ba19c8fe7f0d499545");
  assert.equal(config.packages["."]["package-name"], "atlas-core");
  assert.equal(config.packages["."].component, "atlas-core");
  assert.deepEqual(config.packages["."]["extra-files"], [{ type: "json", path: "plugin.json", jsonpath: "$.version" }]);
});

test("atlas-design agent skill is marked internal for skills CLI discovery", async () => {
  const skillMd = await readFile(new URL("../.agents/skills/atlas-design/SKILL.md", import.meta.url), "utf8");
  const frontmatter = skillMd.slice(4, skillMd.indexOf("\n---\n", 4));

  assert.match(frontmatter, /^name: atlas-design$/m);
  assert.match(frontmatter, /^metadata:\n {2}internal: true$/m);
});

test("public Atlas Core skill is not marked internal", async () => {
  const skillMd = await readFile(new URL("../skills/atlas-core/SKILL.md", import.meta.url), "utf8");
  const frontmatter = skillMd.slice(4, skillMd.indexOf("\n---\n", 4));

  assert.doesNotMatch(frontmatter, /^metadata:\n {2}internal: true$/m);
});

test("build copies local design assets for published artifact injection", async () => {
  const buildScript = await readFile(new URL("../scripts/build.js", import.meta.url), "utf8");

  assert.match(buildScript, /daisyui\.css/);
  assert.match(buildScript, /daisyui-themes\.css/);
  assert.match(buildScript, /tailwindcss-browser\.js/);
});

test("package identity belongs to the private Atlas Core source distribution", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

  assert.equal(packageJson.name, "atlas-core");
  assert.deepEqual(packageJson.bin, { "atlas-core": "dist/cli.mjs" });
  assert.equal(packageJson.private, true);
  assert.equal(packageJson.publishConfig, undefined);
  assert.equal(packageJson.scripts.prepare, undefined);
  assert.equal(packageJson.scripts["install:local"], "node scripts/install-local.js");
  assert.equal(packageJson.repository.url, "git+https://github.com/starthings-solutions/atlas-core.git");
  assert.equal(packageJson.bugs.url, "https://github.com/starthings-solutions/atlas-core/issues");
  assert.equal(packageJson.homepage, "https://github.com/starthings-solutions/atlas-core#readme");
});

test("pnpm lock root importer matches the publish manifest", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const pnpmLock = await readFile(new URL("../pnpm-lock.yaml", import.meta.url), "utf8");

  for (const [name, specifier] of Object.entries(packageJson.dependencies)) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedSpecifier = specifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    assert.match(pnpmLock, new RegExp(`["']?${escapedName}["']?:[\\s\\S]*?specifier: ${escapedSpecifier}`));
  }
});

test("release workflow publishes from the release tag checkout", async () => {
  const workflow = await readFile(new URL("../.github/workflows/release-please.yml", import.meta.url), "utf8");

  assert.match(
    workflow,
    /uses: actions\/checkout@v6\n\s+if: \$\{\{ steps\.release\.outputs\.release_created \}\}\n\s+with:\n\s+ref: \$\{\{ steps\.release\.outputs\.tag_name \}\}/,
  );
});

test("release workflow never publishes Atlas Core to npm", async () => {
  const workflow = await readFile(new URL("../.github/workflows/release-please.yml", import.meta.url), "utf8");

  assert.doesNotMatch(workflow, /\bnpm publish\b/);
  assert.doesNotMatch(workflow, /registry\.npmjs\.org/);
  assert.doesNotMatch(workflow, /id-token:\s*write/);
  assert.match(workflow, /issues:\s*write/);
});
