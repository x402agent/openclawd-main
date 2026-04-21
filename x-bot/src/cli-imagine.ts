import { imagine } from './image.js';
import { postTweet, uploadMedia, me } from './twitter.js';
import { generateImagineCaption } from './agent.js';
import { logSafeConfig } from './config.js';

async function main() {
    logSafeConfig();
    const prompt = process.argv.slice(2).join(' ').trim();
    if (!prompt) {
        console.error('usage: pnpm imagine "<prompt>"');
        process.exit(2);
    }

    const user = await me();
    console.log('[cli-imagine] @%s generating: %s', user.username, prompt);
    const img = await imagine(prompt);
    console.log('[cli-imagine] image saved -> %s', img.filePath);

    const mediaId = await uploadMedia(img.buffer, 'image/png');
    const caption = await generateImagineCaption(prompt, user.username);
    console.log('[cli-imagine] caption:', caption);

    const id = await postTweet(caption, { mediaIds: [mediaId] });
    console.log('[cli-imagine] posted id=%s -> https://x.com/%s/status/%s', id, user.username, id);
}

main().catch(e => { console.error('[cli-imagine] fatal:', e); process.exit(1); });
