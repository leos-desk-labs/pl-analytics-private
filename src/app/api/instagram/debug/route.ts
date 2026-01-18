import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;

export async function GET() {
  if (!META_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'META_ACCESS_TOKEN not configured' }, { status: 500 });
  }

  try {
    // Debug token to check its validity and expiration
    const debugResponse = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${META_ACCESS_TOKEN}&access_token=${META_ACCESS_TOKEN}`
    );
    const debugData = await debugResponse.json();

    if (debugData.error) {
      return NextResponse.json({
        status: 'error',
        error: debugData.error.message,
        tokenExpired: true,
        recommendation: 'Generate a new long-lived token from Meta Developer Console',
        steps: [
          '1. Go to https://developers.facebook.com/tools/explorer/',
          '2. Select your app',
          '3. Generate a User Access Token with required permissions',
          '4. Exchange for long-lived token using the app secret',
          '5. Update META_ACCESS_TOKEN in Vercel environment variables'
        ]
      }, { status: 401 });
    }

    const tokenData = debugData.data;
    const expiresAt = tokenData.expires_at ? new Date(tokenData.expires_at * 1000) : null;
    const isExpired = expiresAt ? expiresAt < new Date() : false;
    const daysUntilExpiry = expiresAt
      ? Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return NextResponse.json({
      status: isExpired ? 'expired' : 'valid',
      tokenInfo: {
        appId: tokenData.app_id,
        type: tokenData.type,
        application: tokenData.application,
        isValid: tokenData.is_valid,
        issuedAt: tokenData.issued_at ? new Date(tokenData.issued_at * 1000).toISOString() : null,
        expiresAt: expiresAt?.toISOString() || 'never',
        daysUntilExpiry: daysUntilExpiry,
        scopes: tokenData.scopes,
      },
      canRefresh: !!META_APP_SECRET,
      refreshUrl: META_APP_ID && META_APP_SECRET
        ? `/api/instagram/refresh`
        : null,
      recommendation: isExpired
        ? 'Token has expired. Generate a new long-lived token.'
        : daysUntilExpiry !== null && daysUntilExpiry < 7
          ? `Token expires in ${daysUntilExpiry} days. Consider refreshing soon.`
          : 'Token is valid.'
    });
  } catch (error) {
    console.error('Token debug error:', error);
    return NextResponse.json({
      status: 'error',
      error: 'Failed to debug token',
      details: String(error)
    }, { status: 500 });
  }
}
