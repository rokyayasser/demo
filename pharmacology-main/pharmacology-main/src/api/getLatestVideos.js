import rssToJson from "rss-to-json";

const CHANNEL_ID = "UCry-8xhMsrlesB7lq3qiL2w";

export async function getLatestVideos() {

  const feed = await rssToJson.parse(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`
  );

  return feed.items.slice(0,6).map((item) => {

    const videoId = item.id.split(":").pop();

    return {
      id: videoId,
      videoId,
      title: item.title,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      date: new Date(item.published).toLocaleDateString("ar-EG")
    };

  });

}