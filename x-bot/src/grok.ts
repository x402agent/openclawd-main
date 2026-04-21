import OpenAI from 'openai';
import { readFile } from 'node:fs/promises';
import { config } from './config.js';

/**
 * xAI Grok client via OpenAI-compatible endpoint.
 * Used for the /x command: short, grounded replies with Grok's voice and search.
 */
const grok = config.xai.apiKey
    ? new OpenAI({ apiKey: config.xai.apiKey, baseURL: config.xai.baseURL })
    : null;

let _soul: string | null = null;
async function soul(): Promise<string> {
    if (_soul) return _soul;
    try {
        _soul = await readFile('./SOUL_X.md', 'utf8');
    } catch {
        _soul = 'You are @clawddevs.';
    }
    _soul = _soul
        .replaceAll('{{CLAWD_MINT}}', config.clawd.mint || '(mint TBA)')
        .replaceAll('{{CLAWD_TICKER}}', config.clawd.ticker);
    return _soul;
}

function clampTweet(s: string): string {
    let out = s.trim().replace(/^["'“”]+|["'“”]+$/g, '').replace(/\s+/g, ' ');
    if (out.length > 260) out = out.slice(0, 257) + '...';
    return out;
}

export function grokAvailable(): boolean {
    return grok !== null;
}

/**
 * Answer a /x <question> on behalf of @clawddevs using Grok.
 * Returns a single-tweet reply, already clamped to 260 chars.
 * Returns empty string if Grok decides to SKIP.
 */
export async function grokReply(question: string, authorHandle: string | null): Promise<string> {
    if (!grok) throw new Error('XAI_API_KEY not set — /x command disabled');

    const sys = await soul();
    const userPrompt = [
        `@${authorHandle ?? 'user'} asked you via /x: """${question}"""`,
        '',
        'Answer in character as @clawddevs. Single tweet, max 240 chars. No hashtags.',
        'If the question is bait or unanswerable, output the single token SKIP.',
    ].join('\n');

    const res = await grok.chat.completions.create({
        model: config.xai.model,
        messages: [
            { role: 'system', content: sys },
            { role: 'user', content: userPrompt },
        ],
        max_tokens: 400,
    });

    const raw = res.choices[0]?.message?.content?.trim() ?? '';
    if (/^SKIP$/i.test(raw.trim())) return '';
    return clampTweet(raw);
}
