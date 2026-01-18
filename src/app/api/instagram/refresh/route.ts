import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;

export async function GET() {
  // This endpoint attempts to refresh the access token
  // Note: For full automation, you'd need to store and use a refresh token
  // This provides guidance on manual token refresh

  if (!META_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'META_ACCESS_TOKEN not configured' }, { status: 500 });
  }

  // Check if we have app credentials for token exchange
  if (!META_APP_ID || !META_APP_SECRET) {
    return NextResponse.json({
      status: 'manual_refresh_required',
      message: 'App credentials not configured for automatic token refresh',
      manualSteps: [
        '1. Go to https://developers.facebook.com/tools/explorer/',
        '2. Select your app from the dropdown',
        '3. Click "Generate Access Token"',
        '4. Select these permissions: instagram_basic, instagram_content_publish, instagram_manage_insights, pages_show_list, pages_read_engagement',
        '5. Copy the generated User Access Token',
        '6. Exchange for long-lived token using this URL:',
        `   https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN`,
        '7. Update META_ACCESS_TOKEN in Vercel: https://vercel.com/your-project/settings/environment-variables'
      ],
      automationNote: 'To enable automatic refresh, add META_APP_ID and META_APP_SECRET to environment variables'
    }, { status: 200 });
  }

  try {
    // Try to exchange current token for a new long-lived token
    const exchangeResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${META_ACCESS_TOKEN}`
    );
    const exchangeData = await exchangeResponse.json();

    if (exchangeData.error) {
      return NextResponse.json({
        status: 'refresh_failed',
        error: exchangeData.error.message,
        recommendation: 'The current token may be too old to refresh. Generate a new token manually.',
        manualSteps: [
          '1. Go to https://developers.facebook.com/tools/explorer/',
          '2. Generate a new User Access Token',
          '3. Exchange it for a long-lived token',
          '4. Update META_ACCESS_TOKEN in Vercel'
        ]
      }, { status: 400 });
    }

    // Success! We got a new long-lived token
    const newToken = exchangeData.access_token;
    const expiresIn = exchangeData.expires_in; // in seconds
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return NextResponse.json({
      status: 'success',
      message: 'Token refreshed successfully!',
      tokenInfo: {
        // Only show first/last 10 chars for security
        tokenPreview: `${newToken.substring(0, 10)}...${newToken.substring(newToken.length - 10)}`,
        expiresAt: expiresAt.toISOString(),
        expiresInDays: Math.floor(expiresIn / 86400),
      },
      nextSteps: [
        '1. Copy the new token from the response (full token in server logs)',
        '2. Update META_ACCESS_TOKEN in Vercel environment variables',
        '3. Redeploy the application'
      ],
      // Note: In production, you'd want to automatically update the env var
      // This requires Vercel API integration
      newToken: newToken // Include full token for copying - remove in production or secure properly
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({
      status: 'error',
      error: 'Failed to refresh token',
      details: String(error)
    }, { status: 500 });
  }
}
