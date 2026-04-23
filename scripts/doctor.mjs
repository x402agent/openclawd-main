#!/usr/bin/env node
// Root doctor: verifies the onboarding flow will work on a fresh clone.
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rows = [];
const mark = (ok, name, detail = "") => rows.push({ ok, name, detail });

const nodeMajor = Number(process.versions.node.split(".")[0]);
mark(nodeMajor >= 20, `node >= 20 (have ${process.versions.node})`);

try {
  const v = execSync("npm -v", { encoding: "utf8" }).trim();
  mark(Number(v.split(".")[0]) >= 10, `npm >= 10 (have ${v})`);
} catch {
  mark(false, "npm on PATH");
}

try {
  const v = execSync("pnpm -v", { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }).trim();
  mark(true, `pnpm on PATH (${v}) — needed for install:stack`);
} catch {
  mark(false, "pnpm on PATH — install:stack and dev:orchestrator need pnpm");
}

const requiredPaths = [
  "package.json",
  ".env.example",
  "ONBOARDING.md",
  "AGENTS/build-catalog.cjs",
  "clawd-code-cli/package.json",
  "clawdrouter/package.json",
  "api-registrar/package.json",
  "clawdhub/package.json",
  "packages/clawd-wallet/package.json",
  "openclawd-stack/pnpm-workspace.yaml",
  "docs/articles",
];
for (const p of requiredPaths) mark(existsSync(join(root, p)), `exists: ${p}`);

const shouldBeGone = [
  "clawd-code-localy",
  "clawd-code-main",
  "clawd-code-proxy-main",
  "gateway",
];
for (const p of shouldBeGone) {
  mark(!existsSync(join(root, p)), `archived/removed: ${p}`);
}

try {
  const pkg = JSON.parse(readFileSync(join(root, "clawd-code-cli/package.json"), "utf8"));
  mark(pkg.name === "clawd-code-cli", `clawd-code-cli package name = "${pkg.name}"`);
  mark(!!pkg.bin?.clawd, `clawd-code-cli exposes "clawd" bin`);
} catch {
  mark(false, "clawd-code-cli/package.json readable");
}

const remainingOldScope = execSync(
  "grep -rl '@solana-clawd/' . 2>/dev/null | grep -v node_modules | grep -v legacy/ | grep -v '\\.git/' | grep -v 'lock\\.' | wc -l",
  { cwd: root, encoding: "utf8" },
).trim();
mark(remainingOldScope === "0", `no lingering @solana-clawd/ refs (found ${remainingOldScope})`);

let failed = 0;
for (const r of rows) {
  const icon = r.ok ? "✓" : "✗";
  if (!r.ok) failed++;
  console.log(`${icon} ${r.name}${r.detail ? `  ${r.detail}` : ""}`);
}
console.log("");
if (failed) {
  console.log(`${failed} check(s) failed.`);
  process.exit(1);
}
console.log("all checks passed.");
