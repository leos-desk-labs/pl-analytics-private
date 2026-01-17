import { NextResponse } from 'next/server';

// TikTok OAuth callback handler
// This receives the authorization code after user approves access

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://pl-analytics-private.vercel.app';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  if (error) {
    console.error('TikTok OAuth error:', error, errorDescription);
    return NextResponse.redirect(`${BASE_URL}/tiktok?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${BASE_URL}/tiktok?error=no_code`);
  }

  if (!TIKTOK_CLIENT_KEY || !TIKTOK_CLIENT_SECRET) {
    return NextResponse.redirect(`${BASE_URL}/tiktok?error=missing_credentials`);
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${BASE_URL}/api/tiktok/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('TikTok token error:', tokenData);
      return NextResponse.redirect(`${BASE_URL}/tiktok?error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`);
    }

    // Success! We have the access token and refresh token
    // In production, you'd store these securely (database, encrypted env var, etc.)
    // For now, we'll display them so you can add to Vercel env vars
    const { access_token, refresh_token, open_id, expires_in } = tokenData;

    console.log('TikTok OAuth success!');
    console.log('Access Token:', access_token);
    console.log('Refresh Token:', refresh_token);
    console.log('Open ID:', open_id);
    console.log('Expires In:', expires_in);

    // Redirect to success page with token info (only for initial setup)
    return NextResponse.redirect(
      `${BASE_URL}/tiktok?success=true&open_id=${open_id}&expires_in=${expires_in}&setup=true`
    );
  } catch (error) {
    console.error('TikTok callback error:', error);
    return NextResponse.redirect(`${BASE_URL}/tiktok?error=callback_failed`);
  }
}
