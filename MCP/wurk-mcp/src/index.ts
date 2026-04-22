import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const WURK_API_BASE = "https://wurkapi.fun/api";
const WURK_QUICK_BASE = "https://wurkapi.fun/api/x402/quick";

// Create MCP server
const server = new McpServer({
  name: "wurk-mcp",
  version: "1.0.0",
});

// Helper function for authenticated requests
async function wurkRequest(
  endpoint: string,
  options: RequestInit = {},
  apiKey?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }

  const response = await fetch(`${WURK_API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

// ──────────────────────────────────────────────────────────────
// UTILITY TOOLS
// ──────────────────────────────────────────────────────────────

// Tool: Check platform balance
server.tool(
  "wurk-balance",
  "Check your WURK platform balance",
  {
    apiKey: z.string().describe("Your WURK API key"),
  },
  async ({ apiKey }) => {
    const response = await wurkRequest("/external/balance", {}, apiKey);
    const data = await response.json();
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Tool: Get available categories
server.tool(
  "wurk-categories",
  "List available job categories",
  {
    apiKey: z.string().describe("Your WURK API key"),
    page: z.number().optional().describe("Page number (default: 1)"),
  },
  async ({ apiKey, page = 1 }) => {
    const response = await wurkRequest(
      `/external/categories?page=${page}`,
      {},
      apiKey
    );
    const data = await response.json();
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// ──────────────────────────────────────────────────────────────
// JOB CREATION TOOLS
// ──────────────────────────────────────────────────────────────

// Tool: Create Social Job
server.tool(
  "wurk-create-social",
  "Create a Twitter/X social engagement job",
  {
    apiKey: z.string().describe("Your WURK API key"),
    tweetUrl: z.string().describe("URL of the tweet to engage with"),
    minRank: z.number().min(1).max(3).describe("Minimum worker rank (1-3)"),
    cooldownMinutes: z.number().min(0).max(1440).describe("Cooldown period in minutes"),
    jobType: z.enum(["repost", "comment", "repost_comment"]).describe("Type of engagement"),
    maxCompletions: z.number().min(25).max(1000).describe("Number of completions"),
    totalUsdc: z.number().positive().describe("Payment amount in USDC"),
    messageMarkdown: z.string().optional().describe("Instructions for comments"),
  },
  async ({
    apiKey,
    tweetUrl,
    minRank,
    cooldownMinutes,
    jobType,
    maxCompletions,
    totalUsdc,
    messageMarkdown,
  }) => {
    const body = {
      type: "social",
      tweet_url: tweetUrl,
      min_rank: minRank,
      cooldown_minutes: cooldownMinutes,
      jobtype: jobType,
      max_completions: maxCompletions,
      total_usdc: totalUsdc,
      ...(messageMarkdown && { message_markdown: messageMarkdown }),
    };

    const response = await wurkRequest(
      "/external/jobs/create",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      apiKey
    );

    const data = await response.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Tool: Create Custom Job (Challenge or Agent Help)
server.tool(
  "wurk-create-custom",
  "Create a custom challenge or agent help job",
  {
    apiKey: z.string().describe("Your WURK API key"),
    jobMode: z.enum(["challenge", "agent_help"]).describe("Job mode"),
    maxCompletions: z.number().min(1).max(500).describe("Number of winners"),
    messageMarkdown: z.string().describe("Task description in markdown"),
    selectionTimeMinutes: z.number().min(2).max(1440).describe("Time to select winners"),
    selectionType: z.enum(["creator", "random"]).describe("Winner selection method"),
    totalUsdc: z.number().positive().describe("Payment amount in USDC"),
    categoryMain: z.string().optional().describe("Main category"),
    categorySub: z.string().optional().describe("Subcategory"),
    community: z.string().optional().describe("Community name"),
  },
  async ({
    apiKey,
    jobMode,
    maxCompletions,
    messageMarkdown,
    selectionTimeMinutes,
    selectionType,
    totalUsdc,
    categoryMain,
    categorySub,
    community,
  }) => {
    const body: Record<string, any> = {
      type: "custom",
      job_mode: jobMode,
      max_completions: maxCompletions,
      message_markdown: messageMarkdown,
      selection_time_minutes: selectionTimeMinutes,
      selection_type: selectionType,
      total_usdc: totalUsdc,
    };

    if (categoryMain) body.category_main = categoryMain;
    if (categorySub) body.category_sub = categorySub;
    if (community) body.community = community;

    const response = await wurkRequest(
      "/external/jobs/create",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      apiKey
    );

    const data = await response.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// ──────────────────────────────────────────────────────────────
// JOB MANAGEMENT TOOLS
// ──────────────────────────────────────────────────────────────

// Tool: List open social jobs
server.tool(
  "wurk-open-social",
  "List your open social jobs",
  {
    apiKey: z.string().describe("Your WURK API key"),
    page: z.number().optional().describe("Page number (default: 1)"),
  },
  async ({ apiKey, page = 1 }) => {
    const response = await wurkRequest(
      `/external/jobs/open/social?page=${page}`,
      {},
      apiKey
    );
    const data = await response.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Tool: List open custom jobs
server.tool(
  "wurk-open-custom",
  "List your open custom jobs",
  {
    apiKey: z.string().describe("Your WURK API key"),
    page: z.number().optional().describe("Page number (default: 1)"),
  },
  async ({ apiKey, page = 1 }) => {
    const response = await wurkRequest(
      `/external/jobs/open/custom?page=${page}`,
      {},
      apiKey
    );
    const data = await response.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Tool: Get job submissions
server.tool(
  "wurk-submissions",
  "Get submissions for a custom job",
  {
    apiKey: z.string().describe("Your WURK API key"),
    jobId: z.string().describe("The job ID"),
    page: z.number().optional().describe("Page number (default: 1)"),
  },
  async ({ apiKey, jobId, page = 1 }) => {
    const response = await wurkRequest(
      `/external/jobs/${jobId}/submissions?page=${page}`,
      {},
      apiKey
    );
    const data = await response.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Tool: Choose winners
server.tool(
  "wurk-choose-winners",
  "Select winners for a creator-selection job",
  {
    apiKey: z.string().describe("Your WURK API key"),
    jobId: z.string().describe("The job ID"),
    submissionIds: z.string().describe("Comma-separated submission IDs"),
  },
  async ({ apiKey, jobId, submissionIds }) => {
    const response = await wurkRequest(
      `/external/jobs/${jobId}/choose-winners`,
      {
        method: "POST",
        body: JSON.stringify({ submissionIds }),
      },
      apiKey
    );
    const data = await response.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// ──────────────────────────────────────────────────────────────
// PAYMENT TOOLS (x402)
// ──────────────────────────────────────────────────────────────

// Tool: Get payment requirements (Solana)
server.tool(
  "wurk-payment-accepts",
  "Get x402 payment requirements for a job",
  {
    apiKey: z.string().describe("Your WURK API key"),
    jobId: z.string().describe("The job ID"),
  },
  async ({ apiKey, jobId }) => {
    const response = await wurkRequest(
      `/x402/jobs/${jobId}/accepts`,
      {},
      apiKey
    );

    // Handle 402 response
    if (response.status === 402) {
      const data = await response.json();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "payment_required",
              paymentRequired: true,
              ...data,
            }, null, 2),
          },
        ],
      };
    }

    const data = await response.json();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Tool: Get Base payment accepts
server.tool(
  "wurk-base-payment-accepts",
  "Get x402 payment requirements for Base chain",
  {
    apiKey: z.string().describe("Your WURK API key"),
    jobId: z.string().describe("The job ID"),
  },
  async ({ apiKey, jobId }) => {
    const response = await wurkRequest(
      `/x402/base/jobs/${jobId}/accepts`,
      {},
      apiKey
    );

    if (response.status === 402) {
      const data = await response.json();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "payment_required",
              network: "base",
              paymentRequired: true,
              ...data,
            }, null, 2),
          },
        ],
      };
    }

    const data = await response.json();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// ──────────────────────────────────────────────────────────────
// QUICK JOBS (No API key required)
// ──────────────────────────────────────────────────────────────

// Tool: Create quick job (no API key needed)
server.tool(
  "wurk-quick-job",
  "Create a preconfigured quick job (no API key required)",
  {
    network: z.enum(["solana", "base"]).describe("Payment network"),
    jobType: z.enum(["reposts-100", "xlikes-100", "insta-likes-100", "dex-rocket-100"]).describe("Quick job type"),
    url: z.string().describe("Target URL (tweet, Instagram post, or DexScreener page)"),
  },
  async ({ network, jobType, url }) => {
    const encodedUrl = encodeURIComponent(url);
    const endpoint = `/quick/${network}/${jobType}?url=${encodedUrl}`;

    // First request gets 402 with payment requirements
    const discoveryResponse = await fetch(`${WURK_QUICK_BASE}${endpoint}`, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (discoveryResponse.status === 402) {
      const data = await discoveryResponse.json();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "payment_required",
              message: "Make second request with X-PAYMENT header to complete",
              quickEndpoint: `${WURK_QUICK_BASE}${endpoint}`,
              paymentRequirements: data,
              instructions: [
                "1. First request returned 402 (expected - this is x402 protocol)",
                "2. To complete payment, use the X-PAYMENT header with x402 payment",
                "3. Use the resource URL from accepts[0].resource",
                "4. Amount: accepts[0].maxAmountRequired (in smallest units)",
              ],
            }, null, 2),
          },
        ],
      };
    }

    // Already paid
    const data = await discoveryResponse.json();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("💰 WURK MCP Server started");
}

main().catch(console.error);
