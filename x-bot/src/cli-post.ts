import { postTweet, me } from './twitter.js';
import { generateAutoPost } from './agent.js';
import { logSafeConfig } from './config.js';

async function main() {
    logSafeConfig();
    const user = await me();
    console.log('[cli-post] authenticated as @%s', user.username);

    const topic = process.argv.slice(2).join(' ').trim() || undefined;
    const text = await generateAutoPost({ topic });
    if (!text) {
        console.log('[cli-post] model chose SKIP. Nothing posted.');
        return;
    }
    console.log('[cli-post] drafted:', text);
    const id = await postTweet(text);
    console.log('[cli-post] posted id=%s -> https://x.com/%s/status/%s', id, user.username, id);
}

main().catch(e => { console.error('[cli-post] fatal:', e); process.exit(1); });
