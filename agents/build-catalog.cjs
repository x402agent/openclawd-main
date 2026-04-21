#!/usr/bin/env node
// Aggregates every agent in src/*.json and template in templates/*.template.json
// into a single agents-catalog.json that the /agents page consumes.
//
// Run: node build-catalog.cjs
// Output: agents-catalog.json (sibling of this script)

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC_DIR = path.join(ROOT, "src");
const TEMPLATES_DIR = path.join(ROOT, "templates");
const OUTPUT = path.join(ROOT, "agents-catalog.json");

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

function loadAgents() {
  const files = fs
    .readdirSync(SRC_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  return files.map((f) => {
    const raw = readJson(path.join(SRC_DIR, f));
    const id = raw.identifier || path.basename(f, ".json");
    const capabilities = raw.solana?.capabilities || [];
    const metaplexSkills = raw.solana?.metaplexSkills || deriveMetaplexSkills(capabilities, raw.meta?.tags || []);
    return {
      identifier: id,
      title: raw.meta?.title || id,
      description: raw.meta?.description || "",
      avatar: raw.meta?.avatar || "🤖",
      tags: raw.meta?.tags || [],
      category: raw.meta?.category || "defi",
      author: raw.author || "solana-clawd",
      createdAt: raw.createdAt || null,
      oneShot: raw.oneShot === true,
      featured: raw.featured === true,
      openingMessage: raw.config?.openingMessage || null,
      openingQuestions: raw.config?.openingQuestions || [],
      tokenUsage: raw.tokenUsage || null,
      capabilities,
      metaplexSkills,
      payment: raw.payment || null,
      agentToken: raw.agentToken || null,
      // Deploy URLs (consumed by AgentGallery deploy buttons)
      deploy: {
        json: `/api/agents/catalog/${encodeURIComponent(id)}.json`,
        chat: `/agents/chat?agent=${encodeURIComponent(id)}`,
        mint: `/agents/mint?template=${encodeURIComponent(id)}`,
        mcp: `/api/agents/catalog/${encodeURIComponent(id)}.json`,
      },
    };
  });
}

// Heuristic: infer Metaplex skill badges from capabilities + tags so older
// agents (without explicit solana.metaplexSkills) still surface correctly.
function deriveMetaplexSkills(capabilities, tags) {
  const skills = new Set();
  const has = (x) => capabilities.includes(x) || tags.includes(x);
  if (has("metaplex-mint-agent") || has("metaplex-register-identity")) skills.add("agent-registry");
  if (has("metaplex-launch-token-genesis") || has("metaplex-launch-bonding-curve") || tags.includes("genesis")) skills.add("genesis");
  if (has("metaplex-mint-core-nft") || tags.includes("mpl-core")) skills.add("core");
  if (has("metaplex-token-metadata")) skills.add("token-metadata");
  if (has("metaplex-mint-cnft") || tags.includes("bubblegum") || tags.includes("cnft")) skills.add("bubblegum");
  if (has("metaplex-deploy-candy-machine") || tags.includes("candy-machine")) skills.add("candy-machine");
  return Array.from(skills);
}

function loadTemplates() {
  if (!fs.existsSync(TEMPLATES_DIR)) return [];
  const files = fs
    .readdirSync(TEMPLATES_DIR)
    .filter((f) => f.endsWith(".template.json"))
    .sort();

  return files.map((f) => {
    const raw = readJson(path.join(TEMPLATES_DIR, f));
    return {
      templateId: raw.templateId,
      name: raw.templateName,
      description: raw.templateDescription,
      category: raw.templateCategory,
      avatar: raw.templateAvatar || "🧩",
      variables: raw.variables || [],
      deploy: {
        template: `/api/agents/templates/${encodeURIComponent(raw.templateId)}.json`,
        create: `/agents/mint?fromTemplate=${encodeURIComponent(raw.templateId)}`,
      },
    };
  });
}

function countByCategory(agents) {
  const map = {};
  for (const a of agents) {
    map[a.category] = (map[a.category] || 0) + 1;
  }
  return map;
}

function build() {
  const agents = loadAgents();
  const templates = loadTemplates();

  const oneShots = agents.filter((a) => a.oneShot);
  const featured = agents.filter((a) => a.featured);

  // Aggregate Metaplex skill coverage across the whole catalog so /agents can
  // render a single shared skill rail and surface per-agent badges.
  const metaplexSkillCounts = {};
  for (const a of agents) {
    for (const skill of a.metaplexSkills) {
      metaplexSkillCounts[skill] = (metaplexSkillCounts[skill] || 0) + 1;
    }
  }

  const metaplexSkill = {
    installCommand: "npx skills add metaplex-foundation/skill",
    mcpServerHint: {
      mcpServers: {
        metaplex: {
          type: "http",
          url: "https://modelcontextprotocol.name/mcp/metaplex",
        },
      },
    },
    programs: [
      { id: "agent-registry", label: "Agent Registry", icon: "🪪", description: "On-chain agent identity, delegation, and execution via MPL Core asset-signer PDAs." },
      { id: "genesis", label: "Genesis", icon: "🚀", description: "Token launches — launchpool (48h deposit window) or bonding curve auto-graduating to Raydium CPMM." },
      { id: "core", label: "Core", icon: "🎨", description: "Next-gen NFTs with plugins, royalty enforcement, attributes, and asset-signer execute hooks." },
      { id: "token-metadata", label: "Token Metadata", icon: "🪙", description: "Classic fungibles, NFTs, pNFTs, and editions." },
      { id: "bubblegum", label: "Bubblegum", icon: "🫧", description: "Compressed NFTs via Merkle trees — required for 10k+ mint scale. Needs DAS-enabled RPC." },
      { id: "candy-machine", label: "Candy Machine", icon: "🍬", description: "Core Candy Machine drops with allowlists, start/end dates, mint limits, and payment guards." },
    ],
    coverage: metaplexSkillCounts,
    ergonomics: [
      { label: "CLI", package: "@metaplex-foundation/cli", entry: "mplx" },
      { label: "Umi SDK", package: "@metaplex-foundation/umi" },
      { label: "Agent Registry SDK", package: "@metaplex-foundation/mpl-agent-registry" },
      { label: "Core SDK", package: "@metaplex-foundation/mpl-core" },
      { label: "Token Metadata SDK", package: "@metaplex-foundation/mpl-token-metadata" },
      { label: "Bubblegum SDK", package: "@metaplex-foundation/mpl-bubblegum" },
      { label: "Candy Machine SDK", package: "@metaplex-foundation/mpl-core-candy-machine" },
      { label: "Genesis SDK", package: "@metaplex-foundation/genesis" },
    ],
  };

  const catalog = {
    $schema: "https://solanaclawd.com/schemas/clawdAgentCatalog.v1.json",
    apiVersion: "1.0",
    generatedAt: new Date().toISOString(),
    hub: {
      gallery: "https://solanaclawd.com/agents",
      mint: "https://solanaclawd.com/agents/mint",
      registry: "https://solanaclawd.com/agents/registry",
      api: "https://solanaclawd.com/api/agents",
    },
    stats: {
      totalAgents: agents.length,
      totalOneShots: oneShots.length,
      totalFeatured: featured.length,
      totalTemplates: templates.length,
      byCategory: countByCategory(agents),
      metaplexEnabledAgents: agents.filter((a) => a.metaplexSkills.length > 0).length,
      tradingCapableAgents: agents.filter((a) => a.capabilities.includes("swap-execution")).length,
      launchCapableAgents: agents.filter(
        (a) =>
          a.capabilities.includes("metaplex-launch-token-genesis") ||
          a.capabilities.includes("metaplex-launch-bonding-curve") ||
          a.capabilities.includes("metaplex-create-agent-token")
      ).length,
      mintCapableAgents: agents.filter(
        (a) =>
          a.capabilities.includes("metaplex-mint-core-nft") ||
          a.capabilities.includes("metaplex-mint-cnft") ||
          a.capabilities.includes("metaplex-deploy-candy-machine")
      ).length,
    },
    metaplexSkill,
    categories: [
      { id: "defi", label: "DeFi", icon: "💰" },
      { id: "trading", label: "Trading", icon: "📈" },
      { id: "nft", label: "NFT", icon: "🎨" },
      { id: "analytics", label: "Analytics", icon: "📊" },
      { id: "security", label: "Security", icon: "🛡️" },
      { id: "dev-tools", label: "Dev Tools", icon: "🛠️" },
      { id: "education", label: "Education", icon: "📚" },
      { id: "governance", label: "Governance", icon: "🗳️" },
    ],
    deployPaths: [
      { id: "install", label: "Install", description: "Copy MCP config for Clawd Desktop / Cursor / ClawdOS" },
      { id: "chat", label: "Chat Now", description: "Open instant chat with the agent" },
      { id: "mint", label: "Mint On-chain", description: "Register as an MPL Core asset on Solana" },
      { id: "fork", label: "Fork", description: "Download the JSON, modify, and submit via PR" },
    ],
    oneShots,
    featured,
    agents,
    templates,
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(catalog, null, 2) + "\n");
  console.log(`✅ Wrote ${OUTPUT}`);
  console.log(`   ${agents.length} agents (${oneShots.length} one-shots, ${featured.length} featured)`);
  console.log(`   ${templates.length} templates`);
}

build();
