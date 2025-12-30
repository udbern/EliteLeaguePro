import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Calendar, X, Maximize, Minimize } from "lucide-react";
import { getTeamLogo } from "@/utils/teamLogos";
import NewsFeed from "@/components/NewsFeed";
import client, { urlFor } from "@/lib/sanityClient";

const mockHighlights = [
  {
    id: 1,
    title: "Manchester United vs Arsenal - Goal Highlights",
    homeTeam: "Manchester United",
    awayTeam: "Arsenal",
    duration: "3:45",
    date: "2024-03-15",
    thumbnail:
      "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&h=450&fit=crop&crop=center",
  },
  {
    id: 2,
    title: "Liverpool vs Chelsea - Best Moments",
    homeTeam: "Liverpool",
    awayTeam: "Chelsea",
    duration: "4:12",
    date: "2024-03-14",
    thumbnail:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=450&fit=crop&crop=center",
  },
  {
    id: 3,
    title: "Manchester City vs Tottenham - Extended Highlights",
    homeTeam: "Manchester City",
    awayTeam: "Tottenham",
    duration: "5:23",
    date: "2024-03-13",
    thumbnail:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=450&fit=crop&crop=center",
  },
];

const VideoHighlights = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchHighlights = async () => {
      setLoading(true);
      try {
        const data = await client.fetch(
          `*[_type == "videoHighlight"] | order(published_at desc) {
            _id,
            title,
            fixture->{
              homeTeam->{
                name,
                logo
              },
              awayTeam->{
                name,
                logo
              },
              match_date
            },
            video{
              asset->{url}
            },
            thumbnail,
            duration,
            published_at
          }`
        );
        const formattedHighlights = data.map((item) => ({
          id: item._id,
          title:
            item.title ||
            `${item.fixture?.homeTeam?.name} vs ${item.fixture?.awayTeam?.name} Highlights`,
          homeTeam: item.fixture?.homeTeam?.name || "Unknown",
          awayTeam: item.fixture?.awayTeam?.name || "Unknown",
          homeTeamLogo: item.fixture?.homeTeam?.logo ? urlFor(item.fixture.homeTeam.logo).width(100).height(100).url() : null,
          awayTeamLogo: item.fixture?.awayTeam?.logo ? urlFor(item.fixture.awayTeam.logo).width(100).height(100).url() : null,
          duration: item.duration || "N/A",
          date: item.published_at || item.fixture?.match_date || new Date(),
          thumbnail: item.thumbnail
            ? urlFor(item.thumbnail).width(800).height(450).url()
            : "https://via.placeholder.com/800x450?text=No+Thumbnail",
          video: item.video,
        }));

        setHighlights(formattedHighlights);
      } catch (error) {
        console.error("Error fetching video highlights:", error);
        // Fallback to mock data if fetch fails
        setHighlights(mockHighlights);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, []);

  const openVideoPlayer = (highlight) => {
    setSelectedVideo(highlight);
  };

  const closeVideoPlayer = () => {
    setSelectedVideo(null);
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleMouseEnter = () => {
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
    setShowControls(false);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
    setShowControls(true);
  };

  const handleVideoClick = () => {
    setShowControls(true);
    if (isPlaying) {
      setTimeout(() => setShowControls(false), 3000);
    }
  };

  return (
    <section className="py-10 sm:py-12 bg-gradient-to-br from-background via-muted/20 to-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Match
            </span>
            <span className="text-foreground  ">Highlights</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Watch the best moments from recent League matches
          </p>
        </div>

        {/* Split layout: 2 Highlights + News in one line on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
          {highlights.slice(0, 2).map((highlight) => (
            <Card
              key={highlight.id}
              onClick={() => openVideoPlayer(highlight)}
              className="group cursor-pointer overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_25px_-8px_hsl(var(--primary)_/_0.3)] bg-card/80 backdrop-blur-sm h-full"
            >
              {/* Thumbnail with proper aspect ratio */}
              <div className="relative aspect-video w-full overflow-hidden">
                <img
                  src={highlight.thumbnail}
                  alt={highlight.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <div className="bg-primary/90 backdrop-blur-sm rounded-full p-2 sm:p-3 md:p-4 group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary-foreground fill-current" />
                  </div>
                </div>
              </div>

              {/* Card Header with better spacing */}
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 md:px-6">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 mb-2 sm:mb-3">
                  <img
                    src={highlight.homeTeamLogo || getTeamLogo(highlight.homeTeam)}
                    alt={highlight.homeTeam}
                    className="w-6 h-6"
                  />
                  <span className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">
                    vs
                  </span>
                  <img
                    src={highlight.awayTeamLogo || getTeamLogo(highlight.awayTeam)}
                    alt={highlight.awayTeam}
                    className="w-6 h-6"
                  />
                </div>
                <CardTitle className="text-xs sm:text-sm md:text-base lg:text-lg leading-tight text-center font-semibold group-hover:text-primary transition-colors duration-300 line-clamp-2 px-1">
                  {highlight.title}
                </CardTitle>
              </CardHeader>

              {/* Card Footer with better spacing */}
              <CardContent className="pt-0 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                <div className="flex items-center justify-between text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 min-w-0 flex-1">
                    <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="truncate">
                      {new Date(highlight.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="md:col-span-1">
            <NewsFeed title="Latest News" showThumbnails={true} />
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div
            className={`relative bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 ${
              isFullscreen ? "w-full h-full" : "w-[95%] max-w-4xl aspect-video"
            }`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <video
              className="w-full h-full object-contain"
              controls
              autoPlay
              src={selectedVideo.video?.asset?.url}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
            />

            {/* Title Panel */}
            <div
              className={`absolute top-4 left-4 bg-black/80 border border-white/10 backdrop-blur-md rounded-xl p-4 max-w-[300px]
        ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        } transition`}
            >
              <h3 className="text-white font-bold text-lg leading-tight">
                {selectedVideo.title}
              </h3>

              <p className="text-white/70 text-sm mt-1">
                {selectedVideo.homeTeam} vs {selectedVideo.awayTeam}
              </p>
            </div>

            {/* Controls */}
            <div
              className={`absolute top-4 right-4 flex gap-2 transition ${
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <button
                onClick={toggleFullscreen}
                className="bg-white/10 hover:bg-white/20 p-3 rounded-full"
              >
                {isFullscreen ? <Minimize /> : <Maximize />}
              </button>

              <button
                onClick={closeVideoPlayer}
                className="bg-red-500 hover:bg-red-600 p-3 rounded-full"
              >
                <X />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VideoHighlights;
