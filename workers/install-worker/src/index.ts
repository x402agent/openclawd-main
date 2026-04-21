/**
 * solanaclawd-install — Cloudflare Worker
 *
 * Serves the openclawd installer at https://solanaclawd.com/install.sh by
 * proxying the latest install.sh from the GitHub repo. Cached at the edge,
 * with a short TTL so updates propagate quickly.
 *
 * Deploy:
 *   cd workers/install-worker && npx wrangler@latest deploy
 *
 * Route must resolve to solanaclawd.com/install.sh (configured in wrangler.toml).
 */

export interface Env {
  INSTALL_RAW_URL: string;
}

const CACHE_TTL_SECONDS = 300; // 5 minutes at the edge

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { allow: "GET, HEAD" },
      });
    }

    // Short health endpoint so `curl -I solanaclawd.com/install.sh` is fast
    // and `curl solanaclawd.com/install/healthz` returns 200.
    if (url.pathname.endsWith("/healthz")) {
      return new Response("ok\n", {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    let response = await cache.match(cacheKey);
    if (response) return response;

    const upstream = await fetch(env.INSTALL_RAW_URL, {
      // Always revalidate against GitHub — we cache our Response ourselves.
      cf: { cacheTtl: 60, cacheEverything: true },
    });

    if (!upstream.ok) {
      return new Response(
        `# solanaclawd install.sh is temporarily unavailable (upstream ${upstream.status}).\n` +
          `# Fallback: curl -fsSL ${env.INSTALL_RAW_URL} | bash\n`,
        {
          status: 502,
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "no-store",
          },
        },
      );
    }

    const body = await upstream.text();
    response = new Response(body, {
      status: 200,
      headers: {
        "content-type": "text/x-shellscript; charset=utf-8",
        "cache-control": `public, max-age=${CACHE_TTL_SECONDS}`,
        "x-installer-source": env.INSTALL_RAW_URL,
        "x-robots-tag": "noindex",
      },
    });

    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  },
} satisfies ExportedHandler<Env>;
