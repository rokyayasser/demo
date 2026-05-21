const axios = require("axios");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 3600 }); // cache for 1 hour

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || "UCry-8xhMsrlesB7lq3qiL2w";

const getLatestVideos = async (req, res) => {
  // Check cache first
  const cached = cache.get("latestVideos");
  if (cached) {
    return res.json({ success: true, data: cached });
  }

  try {
    // Validate API key presence
    if (!YOUTUBE_API_KEY) {
      console.error("YouTube API key is missing in environment variables");
      return res.status(500).json({
        success: false,
        message: "YouTube API key not configured",
      });
    }

    console.log("Fetching channel info for ID:", CHANNEL_ID);

    // First, get the channel's upload playlist ID
    const channelRes = await axios.get(
      "https://www.googleapis.com/youtube/v3/channels",
      {
        params: {
          part: "contentDetails",
          id: CHANNEL_ID,
          key: YOUTUBE_API_KEY,
        },
      },
    );

    console.log("Channel API response status:", channelRes.status);
    console.log("Channel data items:", channelRes.data.items?.length || 0);

    const uploadsPlaylistId =
      channelRes.data.items[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      console.error("No uploads playlist found for channel:", CHANNEL_ID);
      return res
        .status(404)
        .json({ success: false, message: "Uploads playlist not found" });
    }

    console.log("Uploads playlist ID:", uploadsPlaylistId);

    // Get latest 6 videos from that playlist
    const playlistRes = await axios.get(
      "https://www.googleapis.com/youtube/v3/playlistItems",
      {
        params: {
          part: "snippet",
          playlistId: uploadsPlaylistId,
          maxResults: 6,
          key: YOUTUBE_API_KEY,
        },
      },
    );

    console.log("Playlist API response status:", playlistRes.status);
    console.log("Videos found:", playlistRes.data.items?.length || 0);

    const videos = playlistRes.data.items.map((item) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail:
        item.snippet.thumbnails.maxres?.url ||
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.default?.url,
      publishedAt: item.snippet.publishedAt,
      date: new Date(item.snippet.publishedAt).toLocaleDateString("ar-EG"),
    }));

    // Store in cache before sending response
    cache.set("latestVideos", videos);
    res.json({ success: true, data: videos });
  } catch (error) {
    // Detailed error logging
    console.error("YouTube API error details:");
    if (error.response) {
      // The request was made and the server responded with a status code outside 2xx
      console.error("Response status:", error.response.status);
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2),
      );
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request
      console.error("Error message:", error.message);
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch videos",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = { getLatestVideos };
