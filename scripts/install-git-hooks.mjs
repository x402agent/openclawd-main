#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, constants } from "node:fs";
import { accessSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const hooksDir = join(root, ".githooks");

if (process.env.CI) process.exit(0);
if (!existsSync(join(root, ".git"))) process.exit(0);
if (!existsSync(hooksDir)) process.exit(0);

try {
  accessSync(join(root, ".git", "config"), constants.W_OK);
} catch {
  console.log("Skipping git hook install; .git/config is not writable in this environment.");
  process.exit(0);
}

function git(args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

let currentHooksPath = "";
try {
  currentHooksPath = git(["config", "--get", "core.hooksPath"]);
} catch {
  currentHooksPath = "";
}

if (
  currentHooksPath &&
  currentHooksPath !== ".githooks" &&
  currentHooksPath !== "./.githooks"
) {
  console.log(`Skipping git hook install; core.hooksPath already set to ${currentHooksPath}`);
  process.exit(0);
}

git(["config", "core.hooksPath", ".githooks"]);
console.log("Installed repository git hooks (.githooks).");
