#!/usr/bin/env node
// Quick cosmetic pass across agents/src/*.json:
//   - Normalises summary to proper punctuation.
//   - Restores `featured: true` for the pre-existing Solana-native agents that
//     the initial clawdify pass inadvertently demoted.
//
// Run: node agents/scripts/patch-agents.cjs

const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "..", "src");

// Pre-existing Solana-native one-shots that should stay featured.
const FEATURED_IDS = new Set([
  "solana-jupiter-router",
  "solana-kamino-picker",
  "solana-mpl-core-launcher",
  "solana-pumpfun-screener",
  "solana-validator-picker",
  "clawd-mayhem-mode",
  "clawd-pumpfun-official",
]);

function fixSummary(raw) {
  const desc = raw.meta?.description || "";
  if (!desc) return raw;
  const trimmed = desc.replace(/\s+$/, "").replace(/[.!?]+$/, "");
  raw.summary = `${trimmed}. Solana-native CLAWD agent — one-shot deploy from /agents, or mint as an MPL Core asset via the Clawd Router.`;
  return raw;
}

function main() {
  const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith(".json"));
  let patched = 0;

  for (const f of files) {
    const p = path.join(SRC_DIR, f);
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    const id = raw.identifier || f.replace(/\.json$/, "");

    fixSummary(raw);
    if (FEATURED_IDS.has(id)) raw.featured = true;

    fs.writeFileSync(p, JSON.stringify(raw, null, 2) + "\n");
    patched++;
  }

  console.log(`Patched ${patched} agents.`);
}

main();
