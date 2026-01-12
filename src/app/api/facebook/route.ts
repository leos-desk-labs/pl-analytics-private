import { NextResponse } from 'next/server';

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

export async function GET() {
  if (!META_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'META_ACCESS_TOKEN not configured' }, { status: 500 });
  }

  try {
    // With a Page Access Token, "me" refers to the Page directly
    // Get Page info
    const pageInfoResponse = await fetch(
      `https://graph.facebook.com/v24.0/me?fields=id,name,followers_count,fan_count,link,picture&access_token=${META_ACCESS_TOKEN}`
    );
    const pageInfo = await pageInfoResponse.json();

    if (pageInfo.error) {
      return NextResponse.json({ error: pageInfo.error.message }, { status: 400 });
    }

    const pageId = pageInfo.id;

    // Get Page Insights (last 28 days) - using period=days_28
    const insightsResponse = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}/insights?metric=page_impressions,page_engaged_users,page_post_engagements,page_video_views,page_views_total&period=days_28&access_token=${META_ACCESS_TOKEN}`
    );
    const insightsData = await insightsResponse.json();

    let impressions = 0;
    let engagedUsers = 0;
    let postEngagements = 0;
    let videoViews = 0;
    let pageViews = 0;

    if (insightsData.data) {
      insightsData.data.forEach((metric: any) => {
        // Get the most recent value
        const latestValue = metric.values?.[metric.values.length - 1]?.value || 0;

        if (metric.name === 'page_impressions') impressions = latestValue;
        if (metric.name === 'page_engaged_users') engagedUsers = latestValue;
        if (metric.name === 'page_post_engagements') postEngagements = latestValue;
        if (metric.name === 'page_video_views') videoViews = latestValue;
        if (metric.name === 'page_views_total') pageViews = latestValue;
      });
    }

    // Get recent posts with engagement
    const postsResponse = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}/posts?fields=id,message,created_time,shares,likes.summary(true),comments.summary(true)&limit=25&access_token=${META_ACCESS_TOKEN}`
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
      `https://graph.facebook.com/v24.0/${pageId}/videos?fields=id,title,description,length,views,likes.summary(true)&limit=25&access_token=${META_ACCESS_TOKEN}`
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
