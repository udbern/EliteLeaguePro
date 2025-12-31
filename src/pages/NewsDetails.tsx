import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { fetchNewsBySlug, fetchFootballNews } from "@/services/sportmonksNews";
import client, { urlFor } from "@/lib/sanityClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  User,
  ArrowLeft,
  Clock,
  Share2,
  ChevronRight,
  BookOpen,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const NewsDetails = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["news", slug],
    queryFn: async () => {
      // First try sportmonks
      try {
        const sportmonksArticle = await fetchNewsBySlug(slug!);
        if (sportmonksArticle) {
          return { ...sportmonksArticle, source: 'sportmonks' };
        }
      } catch (error) {
        console.log('Sportmonks article not found, trying Sanity');
      }

      // If not found in sportmonks, try Sanity
      const sanityArticle = await client.fetch(
        `*[_type == "news" && slug.current == $slug][0]{
          _id,
          title,
          slug,
          content,
          category,
          thumbnail,
          published_at
        }`,
        { slug }
      );

      if (sanityArticle) {
        // Convert Sanity content to HTML
        let contentHtml = '';
        if (sanityArticle.content && sanityArticle.content.length > 0) {
          contentHtml = sanityArticle.content.map(block => {
            if (block._type === 'block') {
              return `<p>${block.children.map(child => child.text).join('')}</p>`;
            }
            return '';
          }).join('');
        }

        return {
          id: sanityArticle._id,
          title: sanityArticle.title,
          slug: sanityArticle.slug.current,
          content: contentHtml,
          thumbnail_url: sanityArticle.thumbnail ? urlFor(sanityArticle.thumbnail).url() : null,
          category: sanityArticle.category,
          published_at: sanityArticle.published_at,
          read_time: '2 min read',
          source: 'sanity'
        };
      }

      throw new Error('Article not found');
    },
    enabled: !!slug
  });

  const { data: relatedNews } = useQuery({
    queryKey: ["related-news", article?.slug],
    queryFn: async () => {
      const all = await fetchFootballNews();
      return all.filter(n => n.slug !== slug).slice(0, 4);
    },
    enabled: !!article
  });

  const { data: latestNews } = useQuery({
    queryKey: ["latest-news"],
    queryFn: fetchFootballNews
  });

  const handleShare = async () => {
    try {
      await navigator.share({
        title: article?.title,
        text: article?.summary,
        url: window.location.href
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const estimateReadTime = (html: string) => {
    const text = html.replace(/<[^>]+>/g, "");
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-14 w-full mb-4" />
          <Skeleton className="h-6 w-64 mb-8" />
          <Skeleton className="h-[400px] w-full rounded-2xl mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto mb-6 w-20 h-20 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground mb-3">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The article you're looking for doesn't exist or has been removed.
          </p>
          
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      {article.thumbnail_url && (
        <div className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
          <img
            src={article.thumbnail_url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main Content */}
          <div className="lg:col-span-2">
            {!article.thumbnail_url && (
              <Link to="/news" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6 text-sm font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to News
              </Link>
            )}

            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-primary/90 text-primary-foreground px-3 py-1">
                Football
              </Badge>
              <Badge variant={article.source === 'sanity' ? 'default' : 'secondary'} className="px-3 py-1">
                {article.source === 'sanity' ? 'Internal' : 'External'}
              </Badge>
              {article.is_featured && (
                <Badge variant="outline" className="border-primary/50 text-foreground backdrop-blur-sm">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-border text-sm text-muted-foreground">
              {article.author && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{article.author}</p>
                    <p className="text-xs text-muted-foreground">Author</p>
                  </div>
                </div>
              )}
              <Separator orientation="vertical" className="h-10 hidden sm:block" />
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary/70" />
                  {format(new Date(article.published_at), "MMMM d, yyyy")}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary/70" />
                  {estimateReadTime(article.content)} min read
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="ml-auto gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>

            <article className="prose prose-lg dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </article>

            {/* Related News */}
            {relatedNews && relatedNews.length > 0 && (
              <section className="mt-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                    Related Stories
                  </h2>
                  <Link to="/news" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedNews.map(item => (
                    <Link key={item.id} to={`/news/${item.slug}`}>
                      <Card className="group overflow-hidden border-0 bg-card shadow-md hover:shadow-xl transition-all duration-500 h-full">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={item.thumbnail_url || "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600"}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        <CardContent className="p-5">
                          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                            {item.summary}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-8 sticky top-24">
            {latestNews && (
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Latest News
                </h3>
                <div className="space-y-4">
                  {latestNews.slice(0, 5).map(n => (
                    <Link key={n.id} to={`/news/${n.slug}`} className="group flex gap-4 items-start">
                      <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={n.thumbnail_url || "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=200"}
                          alt={n.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {n.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {format(new Date(n.published_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default NewsDetails;
