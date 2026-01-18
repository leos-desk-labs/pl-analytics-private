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

    // Test individual insights endpoints to see which work
    const insightsTests: Record<string, any> = {};

    // Test page_impressions with days_28
    const imp28 = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}/insights?metric=page_impressions&period=days_28&access_token=${pageAccessToken}`
    ).then(r => r.json());
    insightsTests['page_impressions_days_28'] = imp28;

    // Test page_impressions with day
    const impDay = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}/insights?metric=page_impressions&period=day&access_token=${pageAccessToken}`
    ).then(r => r.json());
    insightsTests['page_impressions_day'] = impDay;

    // Test page_post_engagements
    const eng = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}/insights?metric=page_post_engagements&period=days_28&access_token=${pageAccessToken}`
    ).then(r => r.json());
    insightsTests['page_post_engagements_days_28'] = eng;

    // Test page_views_total
    const views = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}/insights?metric=page_views_total&period=day&access_token=${pageAccessToken}`
    ).then(r => r.json());
    insightsTests['page_views_total_day'] = views;

    // Test page_engaged_users
    const engaged = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}/insights?metric=page_engaged_users&period=day&access_token=${pageAccessToken}`
    ).then(r => r.json());
    insightsTests['page_engaged_users_day'] = engaged;

    const insightsData = insightsTests;

    // Test posts endpoint with reactions
    const postsResponse = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}/posts?fields=id,message,created_time,shares,reactions.summary(true),comments.summary(true)&limit=5&access_token=${pageAccessToken}`
    );
    const postsData = await postsResponse.json();

    // Test video endpoints - check multiple locations for videos
    const videosResponse = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}/videos?fields=id,title,views&limit=5&access_token=${pageAccessToken}`
    );
    const videosData = await videosResponse.json();

    // Check for published posts (which may include Reels)
    const publishedResponse = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}/published_posts?fields=id,message,type,shares,reactions.summary(true),comments.summary(true)&limit=10&access_token=${pageAccessToken}`
    );
    const publishedData = await publishedResponse.json();

    // Check feed for video content
    const feedResponse = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}/feed?fields=id,message,type,status_type,attachments{type,media_type,subattachments},shares,reactions.summary(true)&limit=10&access_token=${pageAccessToken}`
    );
    const feedData = await feedResponse.json();

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
      insightsTests: insightsData,
      postsResponse: postsData,
      videosResponse: videosData,
      publishedPostsResponse: publishedData,
      feedResponse: feedData,
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Debug failed', message: String(error) }, { status: 500 });
  }
}
