import { createHash, randomBytes } from 'crypto';

// Generate a unique verification code
export function generateVerificationCode(): string {
  const random = randomBytes(4).toString('hex');
  return `clawd${random}`;
}

// Generate a secure API key
export function generateApiKey(): string {
  const random = randomBytes(32).toString('base64url');
  return `clawd_sk_${random}`;
}

// Hash API key for storage
export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

// Get prefix for display (first 16 chars)
export function getKeyPrefix(apiKey: string): string {
  return apiKey.slice(0, 16);
}

// Validate Solana wallet address
export function isValidSolanaAddress(address: string): boolean {
  const re = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return re.test(address);
}

// Parse X (Twitter) URL to extract username and tweet ID
export function parseXTweetUrl(url: string): { username: string; tweetId: string } | null {
  // Handle various X URL formats
  // https://x.com/username/status/123456789
  // https://twitter.com/username/status/123456789
  // x.com/username/status/123456789
  
  const patterns = [
    /x\.com\/(\w+)\/status\/(\d+)/i,
    /twitter\.com\/(\w+)\/status\/(\d+)/i,
    /(\w+)\/status\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        username: match[1],
        tweetId: match[2],
      };
    }
  }

  return null;
}

// Verify tweet contains the verification code
export async function verifyTweetContainsCode(
  tweetUrl: string,
  expectedCode: string
): Promise<{ valid: boolean; username?: string; error?: string }> {
  try {
    const parsed = parseXTweetUrl(tweetUrl);
    if (!parsed) {
      return { valid: false, error: 'Invalid tweet URL format' };
    }

    // In production, use X API to fetch tweet content
    // For now, we'll simulate the verification
    // TODO: Integrate with X API ( bearer token)
    
    const response = await fetch(
      `https://api.twitter.com/2/tweets/${parsed.tweetId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.X_API_BEARER_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      return { valid: false, error: 'Could not verify tweet' };
    }

    const data = await response.json();
    const tweetText = data.data?.text || '';

    if (tweetText.toLowerCase().includes(expectedCode.toLowerCase())) {
      return { valid: true, username: parsed.username };
    }

    return { valid: false, error: 'Verification code not found in tweet' };
  } catch (error) {
    return { valid: false, error: 'Failed to verify tweet' };
  }
}
