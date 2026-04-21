import { createServer } from 'node:http';

/**
 * Minimal HTTP server so Fly health checks have something to hit.
 * No routing library — this is a worker, not a service.
 */
export function startHealthServer(port: number): void {
    const startedAt = Date.now();
    const server = createServer((req, res) => {
        if (req.url === '/health' || req.url === '/' || req.url === '/healthz') {
            const body = JSON.stringify({
                ok: true,
                service: '@clawddevs',
                uptimeMs: Date.now() - startedAt,
            });
            res.writeHead(200, { 'content-type': 'application/json' });
            res.end(body);
            return;
        }
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end('not found');
    });
    server.listen(port, '0.0.0.0', () => {
        console.log('[x-bot] health server listening on :%d', port);
    });
}
