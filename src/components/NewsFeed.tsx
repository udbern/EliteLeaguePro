import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { fetchFootballNews } from "@/services/sportmonksNews";
import client, { urlFor } from "@/lib/sanityClient";

const NewsFeed = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);

      // Fetch from sportmonks
      let sportmonksData = [];
      try {
        const data = await fetchFootballNews();
        sportmonksData = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching sportmonks news:", error);
        sportmonksData = [];
      }

      // Fetch from Sanity
      const sanityData = await client.fetch(
        `*[_type == "news"] | order(published_at desc) {
          _id,
          title,
          slug,
          content,
          category,
          thumbnail,
          published_at
        }`
      );

      // Map sportmonks data with source
      const mappedSportmonksData = sportmonksData.map(news => ({
        ...news,
        source: 'sportmonks'
      }));

      // Map Sanity data to match sportmonks format
      const mappedSanityData = sanityData
        .filter(news => news && news.title) // Filter out any null/undefined items
        .map(news => {
          // Extract summary from content
          let summary = '';
          if (news.content && news.content.length > 0) {
            const firstBlock = news.content.find(block => block._type === 'block');
            if (firstBlock && firstBlock.children) {
              summary = firstBlock.children.map(child => child.text).join(' ').substring(0, 150) + '...';
            }
          }

          // Handle slug - use current if available, otherwise generate from title or use _id
          let slugValue = '';
          if (news.slug && news.slug.current) {
            slugValue = news.slug.current;
          } else if (news.title) {
            // Generate slug from title as fallback
            slugValue = news.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
          } else {
            // Last resort: use _id
            slugValue = news._id;
          }

          return {
            id: news._id,
            title: news.title,
            slug: slugValue,
            summary: summary,
            thumbnail_url: news.thumbnail ? urlFor(news.thumbnail).url() : null,
            category: news.category || 'other',
            published_at: news.published_at,
            read_time: '2 min read' // Placeholder, could be calculated based on content length
          };
        });

      // Add source to Sanity data
      const mappedSanityDataWithSource = mappedSanityData.map(news => ({
        ...news,
        source: 'sanity'
      }));

      // Merge and sort by published_at descending
      const mergedData = [...mappedSportmonksData, ...mappedSanityDataWithSource]
        .filter(item => item && item.published_at) // Filter out items without published_at
        .sort((a, b) => {
          const dateA = new Date(a.published_at).getTime();
          const dateB = new Date(b.published_at).getTime();
          // Handle invalid dates
          if (isNaN(dateA) && isNaN(dateB)) return 0;
          if (isNaN(dateA)) return 1;
          if (isNaN(dateB)) return -1;
          return dateB - dateA;
        });

      setItems(mergedData);
      setLoading(false);
    };

    loadNews();
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading news…</p>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold">Latest News</h3>

      {items.length === 0 && (
        <div className="text-sm text-muted-foreground">No news yet.</div>
      )}

      <div className="space-y-3">
        {items.slice(0, 4).map((n) => (
          <Link key={n.id} to={`/news/${n.slug}`} className="block">
            <Card className="p-3 bg-card/80 border-border/50 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                {n.thumbnail_url && (
                  <img
                    src={n.thumbnail_url}
                    alt={n.title}
                    className="w-16 h-12 object-cover rounded"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate text-sm">{n.title}</p>
                    <Badge variant="secondary" className="text-[10px]">
                      {n.category}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground truncate">
                    {n.summary}
                  </p>

                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      {n.published_at 
                        ? new Date(n.published_at).toLocaleDateString()
                        : 'Date TBD'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {n.read_time}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
