import { NextResponse } from 'next/server';

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

export async function GET() {
  if (!META_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'META_ACCESS_TOKEN not configured' }, { status: 500 });
  }

  try {
    // Get pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v24.0/me/accounts?fields=id,name,access_token,followers_count,fan_count&access_token=${META_ACCESS_TOKEN}`
    );
    const pagesData = await pagesResponse.json();

    if (pagesData.error) {
      return NextResponse.json({ error: 'Pages error', details: pagesData.error }, { status: 400 });
    }

    const pages = pagesData.data || [];
    const plPage = pages.find((p: any) => p.name?.toLowerCase().includes('peoples league')) || pages[0];

    if (!plPage) {
      return NextResponse.json({ error: 'No page found' }, { status: 400 });
    }

    const pageId = plPage.id;
    const pageAccessToken = plPage.access_token;

    // Test insights endpoint
    const insightsResponse = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}/insights?metric=page_impressions,page_engaged_users,page_post_engagements,page_video_views,page_views_total&period=days_28&access_token=${pageAccessToken}`
    );
    const insightsData = await insightsResponse.json();

    // Test posts endpoint with reactions
    const postsResponse = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}/posts?fields=id,message,created_time,shares,reactions.summary(true),comments.summary(true)&limit=5&access_token=${pageAccessToken}`
    );
    const postsData = await postsResponse.json();

    // Test video endpoint
    const videosResponse = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}/videos?fields=id,title,views&limit=5&access_token=${pageAccessToken}`
    );
    const videosData = await videosResponse.json();

    // Test token permissions
    const tokenDebugResponse = await fetch(
      `https://graph.facebook.com/v24.0/debug_token?input_token=${pageAccessToken}&access_token=${META_ACCESS_TOKEN}`
    );
    const tokenDebug = await tokenDebugResponse.json();

    return NextResponse.json({
      pageId,
      pageName: plPage.name,
      hasPageAccessToken: !!pageAccessToken,
      tokenPermissions: tokenDebug.data?.scopes || [],
      insightsResponse: insightsData,
      postsResponse: postsData,
      videosResponse: videosData,
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Debug failed', message: String(error) }, { status: 500 });
  }
}
