import { NextResponse } from 'next/server';

// TikTok OAuth authorization endpoint
// Redirects user to TikTok to authorize the app

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://pl-analytics-private.vercel.app';

export async function GET() {
  if (!TIKTOK_CLIENT_KEY) {
    return NextResponse.json({ error: 'TIKTOK_CLIENT_KEY not configured' }, { status: 500 });
  }

  // Generate a random state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15);

  // TikTok OAuth authorization URL
  const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
  authUrl.searchParams.set('client_key', TIKTOK_CLIENT_KEY);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'user.info.basic,user.info.profile,user.info.stats,video.list');
  authUrl.searchParams.set('redirect_uri', `${BASE_URL}/api/tiktok/callback`);
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
