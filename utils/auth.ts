
// PKCE (Proof Key for Code Exchange) Utilities
// Used to secure the OAuth flow against interception attacks.

export function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  for (let i = 0; i < length; i++) {
    result += charset[values[i] % charset.length];
  }
  return result;
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export interface PkcePair {
  verifier: string;
  challenge: string;
  nonce: string;
}

export async function createPkcePair(): Promise<PkcePair> {
  const verifier = generateRandomString(128);
  const challenge = await generateCodeChallenge(verifier);
  const nonce = generateRandomString(32);
  
  return { verifier, challenge, nonce };
}
