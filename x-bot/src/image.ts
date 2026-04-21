import OpenAI from 'openai';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { config } from './config.js';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

const HOUSE_STYLE =
    'cyberpunk operator terminal aesthetic, dark background, green/amber phosphor CRT text, subtle glitch grain, Solana-purple highlights, cinematic composition, high contrast';

export interface ImagineResult {
    buffer: Buffer;
    filePath: string;
    revisedPrompt: string | null;
}

/**
 * Generate an image for a /imagine prompt. Buffer is PNG bytes.
 * The prompt is wrapped with the house style unless the caller opts out.
 */
export async function imagine(userPrompt: string, opts: { rawStyle?: boolean } = {}): Promise<ImagineResult> {
    const prompt = opts.rawStyle ? userPrompt : `${userPrompt}. Style: ${HOUSE_STYLE}.`;

    const result = await openai.images.generate({
        model: config.openai.imageModel,
        prompt,
        size: config.openai.imageSize,
        quality: config.openai.imageQuality,
        n: 1,
    });

    const first = result.data?.[0];
    if (!first?.b64_json) throw new Error('Image generation returned no b64_json');

    const buffer = Buffer.from(first.b64_json, 'base64');

    const dir = './data/images';
    await mkdir(dir, { recursive: true });
    const filePath = join(dir, `imagine-${Date.now()}.png`);
    await writeFile(filePath, buffer);

    return {
        buffer,
        filePath,
        revisedPrompt: first.revised_prompt ?? null,
    };
}

/**
 * Parse a /imagine command out of a tweet body. Returns the prompt string, or null if not present.
 * Accepts: "/imagine <prompt>", "imagine: <prompt>" (case-insensitive).
 */
export function parseImagine(text: string): string | null {
    const cleaned = text.replace(/^@\w+\s+/g, '').trim();
    const m = cleaned.match(/(?:^|\s)\/imagine\s+(.+)$/is) ?? cleaned.match(/(?:^|\s)imagine:\s*(.+)$/is);
    if (!m) return null;
    const prompt = m[1]?.trim();
    if (!prompt || prompt.length < 3) return null;
    return prompt.slice(0, 800);
}
