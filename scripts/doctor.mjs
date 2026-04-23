#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rows = [];

function mark(ok, name) {
  rows.push({ ok, name });
}

function commandVersion(command, label, minMajor) {
  try {
    const value = execSync(command, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const major = Number(value.replace(/^v/, "").split(".")[0]);
    mark(Number.isFinite(major) && major >= minMajor, `${label} (have ${value})`);
  } catch {
    mark(false, `${label} (missing)`);
  }
}

const nodeMajor = Number(process.versions.node.split(".")[0]);
mark(nodeMajor >= 20, `node >= 20 (have ${process.versions.node})`);
commandVersion("npm -v", "npm >= 10", 10);
commandVersion("pnpm -v", "pnpm on PATH for openclawd-stack", 8);

const requiredPaths = [
  "package.json",
  ".env.example",
  ".nvmrc",
  "README.md",
  "ONBOARDING.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "STACK.md",
  "install.sh",
  "AGENTS/build-catalog.cjs",
  "clawdrouter/package.json",
  "api-registrar/package.json",
  "clawd-code-cli/package.json",
  "packages/clawd-wallet/package.json",
  "openclawd-stack/package.json",
  "openclawd-stack/pnpm-workspace.yaml",
  "docs/articles/README.md",
];

for (const rel of requiredPaths) {
  mark(existsSync(join(root, rel)), `exists: ${rel}`);
}

for (const rel of ["README.md", "CONTRIBUTING.md", "SECURITY.md", "STACK.md"]) {
  const body = readFileSync(join(root, rel), "utf8");
  mark(!body.includes("./agents/"), `${rel}: no broken ./agents/ links`);
}

try {
  const pkg = JSON.parse(readFileSync(join(root, "clawd-code-cli/package.json"), "utf8"));
  mark(pkg.name === "clawd-code-cli", `clawd-code-cli package name is stable (${pkg.name})`);
} catch {
  mark(false, "clawd-code-cli package.json readable");
}

let failed = 0;
for (const row of rows) {
  if (!row.ok) failed += 1;
  console.log(`${row.ok ? "✓" : "✗"} ${row.name}`);
}

console.log("");
if (failed > 0) {
  console.log(`${failed} check(s) failed.`);
  process.exit(1);
}

console.log("all checks passed.");
