#!/usr/bin/env bun
/**
 * backup.ts — Copy live configs from THIS machine into the repo.
 * Run:  bun scripts/backup.ts [--push]
 *   --push : also stage, commit and push automatically
 *
 * Note: pi/packages/<name>/ are git submodules (pifydev sources) — they are
 * repo-only and are NEVER synced to or from the live ~/.pi/agent/npm folder.
 */
import { cpSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { homedir, platform } from "node:os";

const home = homedir();
const isWin = platform() === "win32";
const repoDir = join(import.meta.dir, "..");

const desktopSettings = isWin
  ? join(home, "AppData", "Roaming", "Paseo", "desktop-settings.json")
  : join(home, ".config", "Paseo", "desktop-settings.json");

// [source on this machine, destination inside the repo]
const mappings: Array<[string, string]> = [
  // pi
  [join(home, ".pi", "agent", "settings.json"), join(repoDir, "pi", "settings.json")],
  [join(home, ".pi", "agent", "models.json"), join(repoDir, "pi", "models.json")],
  [join(home, ".pi", "agent", "models-store.json"), join(repoDir, "pi", "models-store.json")],
  // pi packages — only the npm-project bits; submodule sources stay untouched
  [join(home, ".pi", "agent", "npm", "package.json"), join(repoDir, "pi", "packages", "package.json")],
  [join(home, ".pi", "agent", "npm", "package-lock.json"), join(repoDir, "pi", "packages", "package-lock.json")],
  [join(home, ".pi", "agent", "npm", "node_modules"), join(repoDir, "pi", "packages", "node_modules")],
  // paseo
  [join(home, ".paseo", "config.json"), join(repoDir, "paseo", "config.json")],
  [join(home, ".paseo", "projects", "projects.json"), join(repoDir, "paseo", "projects.json")],
  [join(home, ".paseo", "projects", "workspaces.json"), join(repoDir, "paseo", "workspaces.json")],
  [desktopSettings, join(repoDir, "paseo", "desktop-settings.json")],
];

console.log("Backing up configs into repo...\n");
let ok = 0;
for (const [src, dest] of mappings) {
  if (!existsSync(src)) {
    console.log(`  ✗ missing: ${src}`);
    continue;
  }
  cpSync(src, dest, { recursive: true, force: true });
  const kind = statSync(src).isDirectory() ? "dir " : "file";
  console.log(`  ✓ [${kind}] ${src.replace(home, "~")} -> ${dest.replace(repoDir, ".")}`);
  ok++;
}
console.log(`\n${ok}/${mappings.length} items copied.`);

if (process.argv.includes("--push")) {
  const msg = `backup ${new Date().toISOString().slice(0, 10)}`;
  const run = (cmd: string, args: string[]) => {
    const r = Bun.spawnSync(cmd, args, { cwd: repoDir, stdout: "inherit", stderr: "inherit" });
    if (r.exitCode !== 0) throw new Error(`${cmd} ${args.join(" ")} failed`);
  };
  run("git", ["add", "-A"]);
  const status = Bun.spawnSync(["git", "status", "--porcelain"], { cwd: repoDir });
  if (status.stdout.toString().trim() === "") {
    console.log("Nothing changed — nothing to commit.");
  } else {
    run("git", ["commit", "-m", msg]);
    run("git", ["push"]);
    console.log(`\nPushed: "${msg}"`);
  }
} else {
  console.log("\nNext: git add -A && git commit -m 'backup' && git push  (or run with --push)");
}
