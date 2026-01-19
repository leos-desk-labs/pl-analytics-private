import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// X (Twitter) OAuth callback handler
// This receives the authorization code after user approves access

const X_CLIENT_ID = process.env.X_CLIENT_ID;
const X_CLIENT_SECRET = process.env.X_CLIENT_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://pl-analytics-private.vercel.app';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  if (error) {
    console.error('X OAuth error:', error, errorDescription);
    return NextResponse.redirect(`${BASE_URL}/x?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${BASE_URL}/x?error=no_code`);
  }

  // Get code verifier and state from cookies
  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get('x_code_verifier')?.value;
  const storedState = cookieStore.get('x_oauth_state')?.value;

  // Verify state to prevent CSRF
  if (state !== storedState) {
    console.error('X OAuth state mismatch');
    return NextResponse.redirect(`${BASE_URL}/x?error=state_mismatch`);
  }

  if (!codeVerifier) {
    console.error('X OAuth code verifier missing');
    return NextResponse.redirect(`${BASE_URL}/x?error=missing_verifier`);
  }

  if (!X_CLIENT_ID || !X_CLIENT_SECRET) {
    return NextResponse.redirect(`${BASE_URL}/x?error=missing_credentials`);
  }

  try {
    // Exchange authorization code for access token
    const credentials = Buffer.from(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`).toString('base64');

    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${BASE_URL}/api/x/callback`,
        code_verifier: codeVerifier,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('X token error:', tokenData);
      return NextResponse.redirect(`${BASE_URL}/x?error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`);
    }

    // Success! We have the access token and refresh token
    const { access_token, refresh_token, expires_in } = tokenData;

    console.log('X OAuth success!');
    console.log('Access Token:', access_token);
    console.log('Refresh Token:', refresh_token);
    console.log('Expires In:', expires_in);

    // Clear the PKCE cookies
    const response = NextResponse.redirect(
      `${BASE_URL}/x?success=true&expires_in=${expires_in}&setup=true`
    );
    response.cookies.delete('x_code_verifier');
    response.cookies.delete('x_oauth_state');

    return response;
  } catch (error) {
    console.error('X callback error:', error);
    return NextResponse.redirect(`${BASE_URL}/x?error=callback_failed`);
  }
}
