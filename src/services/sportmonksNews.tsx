import axios from "axios";

const GUARDIAN_API_KEY = import.meta.env.VITE_GUARDIAN_API_KEY;
const GUARDIAN_API_BASE_URL = "https://content.guardianapis.com";

/**
 * Fetch football news from The Guardian
 */
export const fetchFootballNews = async () => {
  try {
    const res = await axios.get(`${GUARDIAN_API_BASE_URL}/search`, {
      params: {
        q: "football OR soccer OR premier league",
        section: "sport|football",
        "show-fields": "headline,trailText,body,thumbnail,byline",
        "page-size": 4,
        "order-by": "newest",
        "api-key": GUARDIAN_API_KEY,
      },
    });

    return res.data.response.results.map((article, index) => {
      const title = article.fields?.headline || article.webTitle;

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      return {
        id: index + 1, // internal use only
        slug,
        title,
        summary: article.fields?.trailText || article.webTitle,
        content: article.fields?.body || article.fields?.trailText,
        category: "Football",
        published_at: article.webPublicationDate,
        thumbnail_url: article.fields?.thumbnail,
        author: article.fields?.byline || "The Guardian",
        read_time: "3 min read",
        source_url: article.webUrl,
      };
    });
  } catch (error) {
    console.error("Guardian API error:", error);

    // fallback mock data
    const { mockNews } = await import("@/lib/mockNews");
    return mockNews.map((item, index) => ({
      id: index + 1,
      slug: item.slug,
      title: item.title,
      summary: item.summary,
      content: `<p>${item.summary}</p>`,
      category: item.category,
      published_at: item.published_at,
      thumbnail_url: item.thumbnail_url,
      author: "Sport Desk",
      read_time: "3 min read",
    }));
  }
};

/**
 * Fetch single article by SLUG
 */
export const fetchNewsBySlug = async (slug) => {
  try {
    const articles = await fetchFootballNews();
    return articles.find((article) => article.slug === slug) || null;
  } catch (error) {
    console.error("Fetch by slug error:", error);
    return null;
  }
};
