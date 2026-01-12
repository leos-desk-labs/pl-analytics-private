import { NextResponse } from 'next/server';

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

export async function GET() {
  if (!META_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'META_ACCESS_TOKEN not configured' }, { status: 500 });
  }

  try {
    // With a Page Access Token, "me" refers to the Page directly
    // Get Instagram Business Account connected to the Page
    const igAccountResponse = await fetch(
      `https://graph.facebook.com/v24.0/me?fields=instagram_business_account&access_token=${META_ACCESS_TOKEN}`
    );
    const igAccountData = await igAccountResponse.json();

    if (igAccountData.error) {
      return NextResponse.json({ error: igAccountData.error.message }, { status: 400 });
    }

    if (!igAccountData.instagram_business_account) {
      return NextResponse.json({
        error: 'No Instagram Business Account connected to this Facebook Page',
        hint: 'Make sure your Instagram account is a Professional/Business account and is linked to your Facebook Page'
      }, { status: 404 });
    }

    const igAccountId = igAccountData.instagram_business_account.id;

    // Get Instagram account info and metrics
    const igInfoResponse = await fetch(
      `https://graph.facebook.com/v24.0/${igAccountId}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count&access_token=${META_ACCESS_TOKEN}`
    );
    const igInfo = await igInfoResponse.json();

    if (igInfo.error) {
      return NextResponse.json({ error: igInfo.error.message }, { status: 400 });
    }

    // Get Instagram Insights (reach, impressions, etc.) - last 30 days
    const insightsResponse = await fetch(
      `https://graph.facebook.com/v24.0/${igAccountId}/insights?metric=reach,impressions,profile_views&period=day&since=${Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60}&until=${Math.floor(Date.now() / 1000)}&access_token=${META_ACCESS_TOKEN}`
    );
    const insightsData = await insightsResponse.json();

    // Calculate totals from insights
    let totalReach = 0;
    let totalImpressions = 0;
    let totalProfileViews = 0;

    if (insightsData.data) {
      insightsData.data.forEach((metric: any) => {
        const total = metric.values?.reduce((sum: number, v: any) => sum + (v.value || 0), 0) || 0;
        if (metric.name === 'reach') totalReach = total;
        if (metric.name === 'impressions') totalImpressions = total;
        if (metric.name === 'profile_views') totalProfileViews = total;
      });
    }

    // Get recent media to calculate video views
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v24.0/${igAccountId}/media?fields=id,media_type,like_count,comments_count,insights.metric(plays,reach,impressions)&limit=50&access_token=${META_ACCESS_TOKEN}`
    );
    const mediaData = await mediaResponse.json();

    let totalReelsViews = 0;
    let totalLikes = 0;
    let totalComments = 0;

    if (mediaData.data) {
      mediaData.data.forEach((media: any) => {
        totalLikes += media.like_count || 0;
        totalComments += media.comments_count || 0;

        // Get plays/views from video content (Reels)
        if (media.insights?.data) {
          media.insights.data.forEach((insight: any) => {
            if (insight.name === 'plays') {
              totalReelsViews += insight.values?.[0]?.value || 0;
            }
          });
        }
      });
    }

    return NextResponse.json({
      accountId: igAccountId,
      username: igInfo.username,
      name: igInfo.name,
      profilePicture: igInfo.profile_picture_url,
      followers: igInfo.followers_count,
      following: igInfo.follows_count,
      mediaCount: igInfo.media_count,
      // Insights (last 30 days)
      reach: totalReach,
      impressions: totalImpressions,
      profileViews: totalProfileViews,
      // Content metrics
      reelsViews: totalReelsViews,
      interactions: totalLikes + totalComments,
      likes: totalLikes,
      comments: totalComments,
    });
  } catch (error) {
    console.error('Instagram API error:', error);
    return NextResponse.json({ error: 'Failed to fetch Instagram data' }, { status: 500 });
  }
}
