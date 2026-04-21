import { fal } from '@fal-ai/client';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { config } from './config.js';

if (config.fal.apiKey) {
    fal.config({ credentials: config.fal.apiKey });
}

const HOUSE_STYLE =
    'cyberpunk operator terminal aesthetic, dark background, phosphor CRT glow, subtle glitch grain, Solana-purple highlights, cinematic';

export function falAvailable(): boolean {
    return Boolean(config.fal.apiKey);
}

export interface FalMediaResult {
    buffer: Buffer;
    filePath: string;
    url: string;
    mime: 'image/png' | 'image/jpeg' | 'video/mp4';
}

async function downloadToBuffer(url: string): Promise<Buffer> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`download failed ${res.status}`);
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
}

/** /art — fast diffusion art via FAL (flux/schnell by default). Returns image buffer. */
export async function generateArt(prompt: string): Promise<FalMediaResult> {
    if (!falAvailable()) throw new Error('FAL_API_KEY not set — /art disabled');
    const styled = `${prompt}. Style: ${HOUSE_STYLE}.`;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const result = await fal.subscribe(config.fal.artModel, {
        input: {
            prompt: styled,
            image_size: 'square_hd',
            num_images: 1,
        },
        logs: false,
    } as any);

    const data: any = (result as any).data ?? result;
    const img = data.images?.[0];
    const url: string | undefined = img?.url;
    if (!url) throw new Error('FAL art: no image url in response');
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const buffer = await downloadToBuffer(url);
    const dir = './data/images';
    await mkdir(dir, { recursive: true });
    const filePath = join(dir, `art-${Date.now()}.png`);
    await writeFile(filePath, buffer);

    return { buffer, filePath, url, mime: 'image/png' };
}

/**
 * /video — short video via FAL Kling image-to-video.
 * Kling requires an input image, so we first generate a keyframe with the art model,
 * then animate it.
 */
export async function generateVideo(prompt: string): Promise<FalMediaResult> {
    if (!falAvailable()) throw new Error('FAL_API_KEY not set — /video disabled');

    // 1. Generate keyframe
    const keyframe = await generateArt(prompt);

    // 2. Animate it
    const styled = `${prompt}. Motion: slow cinematic camera push, glitch pulses, ${HOUSE_STYLE}.`;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const result = await fal.subscribe(config.fal.videoModel, {
        input: {
            prompt: styled,
            image_url: keyframe.url,
            duration: '5',
        },
        logs: false,
    } as any);

    const data: any = (result as any).data ?? result;
    const url: string | undefined = data.video?.url ?? data.url;
    if (!url) throw new Error('FAL video: no video url in response');
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const buffer = await downloadToBuffer(url);
    const dir = './data/videos';
    await mkdir(dir, { recursive: true });
    const filePath = join(dir, `video-${Date.now()}.mp4`);
    await writeFile(filePath, buffer);

    return { buffer, filePath, url, mime: 'video/mp4' };
}
