import { NextResponse } from 'next/server';

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

export async function GET() {
  if (!META_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'META_ACCESS_TOKEN not configured' }, { status: 500 });
  }

  try {
    // First, get the list of pages the user manages and their page access tokens
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v24.0/me/accounts?fields=id,name,access_token,followers_count,fan_count&access_token=${META_ACCESS_TOKEN}`
    );
    const pagesData = await pagesResponse.json();

    if (pagesData.error) {
      return NextResponse.json({ error: pagesData.error.message }, { status: 400 });
    }

    // Find the Peoples League page (or use the first page if only one)
    const pages = pagesData.data || [];
    const plPage = pages.find((p: any) => p.name?.toLowerCase().includes('peoples league')) || pages[0];

    if (!plPage) {
      return NextResponse.json({ error: 'No Facebook Pages found. Make sure the token has pages_show_list permission.' }, { status: 400 });
    }

    const pageId = plPage.id;
    const pageAccessToken = plPage.access_token; // Use the page-specific token

    // Get additional page info
    const pageInfoResponse = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}?fields=id,name,followers_count,fan_count,link,picture&access_token=${pageAccessToken}`
    );
    const pageInfo = await pageInfoResponse.json();

    if (pageInfo.error) {
      return NextResponse.json({ error: pageInfo.error.message }, { status: 400 });
    }

    // Get Page Insights - using separate calls for different metric types
    // Some metrics need 'day' period, others need 'days_28'
    let impressions = 0;
    let engagedUsers = 0;
    let postEngagements = 0;
    let videoViews = 0;
    let pageViews = 0;

    // Try fetching insights with valid v24.0 metrics
    try {
      // page_impressions and page_post_engagements with days_28 period
      const insightsResponse1 = await fetch(
        `https://graph.facebook.com/v24.0/${pageId}/insights?metric=page_impressions,page_post_engagements&period=days_28&access_token=${pageAccessToken}`
      );
      const insights1 = await insightsResponse1.json();

      if (insights1.data) {
        insights1.data.forEach((metric: any) => {
          const latestValue = metric.values?.[metric.values.length - 1]?.value || 0;
          if (metric.name === 'page_impressions') impressions = latestValue;
          if (metric.name === 'page_post_engagements') postEngagements = latestValue;
        });
      }

      // page_views_total with day period
      const insightsResponse2 = await fetch(
        `https://graph.facebook.com/v24.0/${pageId}/insights?metric=page_views_total&period=day&access_token=${pageAccessToken}`
      );
      const insights2 = await insightsResponse2.json();

      if (insights2.data) {
        // Sum up the last 28 days
        const pageViewsMetric = insights2.data.find((m: any) => m.name === 'page_views_total');
        if (pageViewsMetric?.values) {
          pageViews = pageViewsMetric.values.reduce((sum: number, v: any) => sum + (v.value || 0), 0);
        }
      }

      // page_fans_online (for engaged users approximation) with day period
      const insightsResponse3 = await fetch(
        `https://graph.facebook.com/v24.0/${pageId}/insights?metric=page_engaged_users&period=day&access_token=${pageAccessToken}`
      );
      const insights3 = await insightsResponse3.json();

      if (insights3.data) {
        const engagedMetric = insights3.data.find((m: any) => m.name === 'page_engaged_users');
        if (engagedMetric?.values) {
          engagedUsers = engagedMetric.values.reduce((sum: number, v: any) => sum + (v.value || 0), 0);
        }
      }
    } catch (insightErr) {
      console.log('Page insights fetch error (non-fatal):', insightErr);
    }

    // Get recent posts with engagement
    const postsResponse = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}/posts?fields=id,message,created_time,shares,likes.summary(true),comments.summary(true)&limit=25&access_token=${pageAccessToken}`
    );
    const postsData = await postsResponse.json();

    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    const recentPosts: any[] = [];

    if (postsData.data) {
      postsData.data.forEach((post: any) => {
        const likes = post.likes?.summary?.total_count || 0;
        const comments = post.comments?.summary?.total_count || 0;
        const shares = post.shares?.count || 0;

        totalLikes += likes;
        totalComments += comments;
        totalShares += shares;

        recentPosts.push({
          id: post.id,
          message: post.message?.substring(0, 100) || '',
          createdTime: post.created_time,
          likes,
          comments,
          shares,
        });
      });
    }

    // Get video posts specifically for video views
    const videosResponse = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}/videos?fields=id,title,description,length,views,likes.summary(true)&limit=25&access_token=${pageAccessToken}`
    );
    const videosData = await videosResponse.json();

    let totalVideoViewsFromPosts = 0;
    if (videosData.data) {
      videosData.data.forEach((video: any) => {
        totalVideoViewsFromPosts += video.views || 0;
      });
    }

    // Use the higher of the two video view counts
    const finalVideoViews = Math.max(videoViews, totalVideoViewsFromPosts);

    return NextResponse.json({
      pageId,
      pageName: pageInfo.name,
      followers: pageInfo.followers_count || pageInfo.fan_count || 0,
      pageLink: pageInfo.link,
      picture: pageInfo.picture?.data?.url,
      // Insights (last 28 days)
      impressions,
      reach: engagedUsers, // Using engaged users as a proxy for reach
      videoViews: finalVideoViews,
      pageViews,
      // Engagements
      engagements: postEngagements,
      totalLikes,
      totalComments,
      totalShares,
      // Recent posts
      recentPosts: recentPosts.slice(0, 5),
    });
  } catch (error) {
    console.error('Facebook API error:', error);
    return NextResponse.json({ error: 'Failed to fetch Facebook data' }, { status: 500 });
  }
}
