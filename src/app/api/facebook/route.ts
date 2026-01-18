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

    // Get Page Insights - only using metrics valid in v24.0
    // Note: page_impressions and page_engaged_users are deprecated
    let postEngagements = 0;
    let videoViews = 0;
    let pageViews = 0;

    // Fetch insights with valid v24.0 metrics
    try {
      // page_post_engagements with days_28 period (this metric still works)
      const engagementsResponse = await fetch(
        `https://graph.facebook.com/v24.0/${pageId}/insights?metric=page_post_engagements&period=days_28&access_token=${pageAccessToken}`
      );
      const engagementsData = await engagementsResponse.json();

      if (engagementsData.data) {
        const engMetric = engagementsData.data.find((m: any) => m.name === 'page_post_engagements');
        if (engMetric?.values?.length > 0) {
          // Get the most recent value
          postEngagements = engMetric.values[engMetric.values.length - 1]?.value || 0;
        }
      }

      // page_views_total with day period
      const viewsResponse = await fetch(
        `https://graph.facebook.com/v24.0/${pageId}/insights?metric=page_views_total&period=day&access_token=${pageAccessToken}`
      );
      const viewsData = await viewsResponse.json();

      if (viewsData.data) {
        const pageViewsMetric = viewsData.data.find((m: any) => m.name === 'page_views_total');
        if (pageViewsMetric?.values) {
          pageViews = pageViewsMetric.values.reduce((sum: number, v: any) => sum + (v.value || 0), 0);
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
      // Note: impressions metric deprecated in v24.0, using post engagements instead
      videoViews: finalVideoViews,
      pageViews,
      // Engagements (28 day rolling)
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
