#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const checks = [
  {
    file: "README.md",
    patterns: [/welcome to the claw/i, /\bthe claw\b/i, /\byour claw\b/i, /\bOpenClaw\b/i],
  },
  {
    file: "INSTALL_SNIPPETS.md",
    patterns: [/welcome to the claw/i, /\bthe claw\b/i, /\byour claw\b/i],
  },
  {
    file: "docs/demo.html",
    patterns: [/welcome to the claw/i, /\bSoul of the Claw\b/i, /\bshape this claw\b/i, /\byour claw\b/i],
  },
  {
    file: "ONBOARDING.md",
    patterns: [/\bOpenClaw\b/i],
  },
  {
    file: "SECURITY_VAULT_INTEGRATION.md",
    patterns: [/`agents\/vault-agent\.json`/],
  },
];

const failures = [];

for (const check of checks) {
  const body = readFileSync(join(root, check.file), "utf8");
  for (const pattern of check.patterns) {
    if (pattern.test(body)) {
      failures.push(`${check.file} matched forbidden branding pattern ${pattern}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Brand check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Brand check passed.");
