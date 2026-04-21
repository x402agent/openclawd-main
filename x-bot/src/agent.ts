import OpenAI from 'openai';
import { readFile } from 'node:fs/promises';
import { config } from './config.js';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

let _soul: string | null = null;

async function soul(): Promise<string> {
    if (_soul) return _soul;
    try {
        _soul = await readFile('./SOUL_X.md', 'utf8');
    } catch {
        _soul = 'You are @clawddevs, the X voice of solana-clawd. Terse, dry, confident. One thought per post.';
    }
    _soul = _soul
        .replaceAll('{{CLAWD_MINT}}', config.clawd.mint || '(mint TBA)')
        .replaceAll('{{CLAWD_TICKER}}', config.clawd.ticker);
    return _soul;
}

async function chat(system: string, user: string, maxTokens = 300): Promise<string> {
    const res = await openai.chat.completions.create({
        model: config.openai.chatModel,
        messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
        ],
        max_completion_tokens: maxTokens,
    });
    return res.choices[0]?.message?.content?.trim() ?? '';
}

function clampTweet(s: string): string {
    // Strip surrounding quotes some models add, collapse whitespace, cap at 280.
    let out = s.trim().replace(/^["'“”]+|["'“”]+$/g, '').replace(/\s+/g, ' ');
    if (out.length > 280) out = out.slice(0, 277) + '...';
    return out;
}

export async function generateReply(input: {
    authorHandle: string | null;
    tweetText: string;
    conversationContext?: string;
}): Promise<string> {
    const sys = await soul();
    const prompt = [
        `You are replying to @${input.authorHandle ?? 'user'} on X.`,
        `Their tweet: """${input.tweetText}"""`,
        input.conversationContext ? `Context: """${input.conversationContext}"""` : '',
        '',
        'Write a single reply in character. Max 260 chars. No hashtags unless the payload demands one. No emoji spam.',
        'If the tweet is low-effort bait, reply with a dry one-liner or skip with the single token SKIP.',
    ].filter(Boolean).join('\n');

    const raw = await chat(sys, prompt, 220);
    if (/^SKIP$/i.test(raw.trim())) return '';
    return clampTweet(raw);
}

export async function generateAutoPost(input: { topic?: string; signal?: string } = {}): Promise<string> {
    const sys = await soul();
    const prompt = [
        'Write one autonomous post for the @clawddevs timeline right now.',
        input.topic ? `Topic: ${input.topic}` : 'Topic: dev log, $CLAWD status, or Solana ecosystem observation.',
        input.signal ? `Signal to reference: ${input.signal}` : '',
        '',
        'Constraints:',
        '- Max 260 chars',
        '- One idea. No threads.',
        '- No financial advice. No "buy now".',
        '- If nothing real happened, output the single token SKIP.',
    ].filter(Boolean).join('\n');

    const raw = await chat(sys, prompt, 220);
    if (/^SKIP$/i.test(raw.trim())) return '';
    return clampTweet(raw);
}

export async function generateImagineCaption(userPrompt: string, authorHandle: string | null): Promise<string> {
    const sys = await soul();
    const prompt = [
        `Someone (@${authorHandle ?? 'user'}) asked for /imagine with prompt: """${userPrompt}"""`,
        'Write a single-line caption for the image reply, in character. Max 180 chars. No hashtags. No emoji spam.',
    ].join('\n');
    const raw = await chat(sys, prompt, 120);
    const caption = clampTweet(raw);
    return caption || `rendered: ${userPrompt.slice(0, 160)}`;
}
