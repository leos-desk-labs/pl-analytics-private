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
    return NextResponse.json({
      error: 'X OAuth error',
      details: errorDescription || error,
    }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code received' }, { status: 400 });
  }

  // Get code verifier and state from cookies
  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get('x_code_verifier')?.value;
  const storedState = cookieStore.get('x_oauth_state')?.value;

  // Log for debugging
  console.log('Callback received - code:', code?.substring(0, 20) + '...');
  console.log('State from URL:', state);
  console.log('State from cookie:', storedState);
  console.log('Code verifier exists:', !!codeVerifier);

  // Verify state to prevent CSRF (skip if cookies missing - serverless issue)
  if (storedState && state !== storedState) {
    console.error('X OAuth state mismatch');
    return NextResponse.json({
      error: 'State mismatch - CSRF protection triggered',
      received: state,
      expected: storedState,
    }, { status: 400 });
  }

  if (!codeVerifier) {
    // Cookie likely lost due to serverless - show helpful message
    return NextResponse.json({
      error: 'Code verifier missing',
      message: 'The PKCE code verifier cookie was lost. This can happen with serverless functions.',
      hint: 'Try the authorization again. If it keeps failing, we may need to use a different auth approach.',
    }, { status: 400 });
  }

  if (!X_CLIENT_ID || !X_CLIENT_SECRET) {
    return NextResponse.json({
      error: 'Missing X credentials',
      hasClientId: !!X_CLIENT_ID,
      hasClientSecret: !!X_CLIENT_SECRET,
    }, { status: 500 });
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
      return NextResponse.json({
        error: 'Token exchange failed',
        details: tokenData,
      }, { status: 400 });
    }

    // Success! We have the access token and refresh token
    const { access_token, refresh_token, expires_in } = tokenData;

    console.log('X OAuth success!');
    console.log('Refresh Token:', refresh_token);

    // Return the tokens directly so user can copy them
    // Clear the PKCE cookies
    const response = NextResponse.json({
      success: true,
      message: 'Authorization successful! Copy the refresh_token below and add it to Vercel as X_REFRESH_TOKEN',
      refresh_token: refresh_token,
      access_token: access_token,
      expires_in: expires_in,
      next_steps: [
        '1. Copy the refresh_token value above',
        '2. Go to Vercel > Project Settings > Environment Variables',
        '3. Add X_REFRESH_TOKEN with the refresh_token value',
        '4. Redeploy the app',
        '5. Visit /x to see your analytics',
      ],
    });

    response.cookies.delete('x_code_verifier');
    response.cookies.delete('x_oauth_state');

    return response;
  } catch (err) {
    console.error('X callback error:', err);
    return NextResponse.json({
      error: 'Callback failed',
      details: String(err),
    }, { status: 500 });
  }
}
