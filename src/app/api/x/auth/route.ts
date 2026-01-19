import { NextResponse } from 'next/server';

// X (Twitter) OAuth 2.0 authorization endpoint
// Redirects user to X to authorize the app
// Protected by ADMIN_SECRET - only admins can connect accounts

const X_CLIENT_ID = process.env.X_CLIENT_ID;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://pl-analytics-private.vercel.app';
const ADMIN_SECRET = process.env.ADMIN_SECRET;

// PKCE code verifier storage (in production, use a more persistent solution)
let codeVerifier: string | null = null;

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = Array.from(new Uint8Array(digest));
  return btoa(String.fromCharCode.apply(null, bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function GET(request: Request) {
  // Admin secret protection - require ?secret=YOUR_ADMIN_SECRET
  const url = new URL(request.url);
  const providedSecret = url.searchParams.get('secret');

  if (!ADMIN_SECRET) {
    return NextResponse.json({
      error: 'ADMIN_SECRET not configured',
      message: 'Add ADMIN_SECRET environment variable to Vercel to protect auth endpoints',
    }, { status: 500 });
  }

  if (providedSecret !== ADMIN_SECRET) {
    return NextResponse.json({
      error: 'Unauthorized',
      message: 'Admin access required. Use ?secret=YOUR_ADMIN_SECRET',
    }, { status: 401 });
  }

  if (!X_CLIENT_ID) {
    return NextResponse.json({ error: 'X_CLIENT_ID not configured' }, { status: 500 });
  }

  // Generate PKCE values
  codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Generate a random state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15);

  // X OAuth 2.0 authorization URL
  const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', X_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', `${BASE_URL}/api/x/callback`);
  authUrl.searchParams.set('scope', 'tweet.read users.read offline.access');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  // Store code verifier in cookie for callback (in production, use session storage)
  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set('x_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
  });
  response.cookies.set('x_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
  });

  return response;
}

