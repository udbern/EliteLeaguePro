import React from "react";
import VideoHighlights from "@/components/VideoHighlights";
import TopThreeTeams from "@/components/TopThreeTeams";
import TopScorers from "@/components/TopScorers";
import FixturesCarousel from "@/components/FixturesCarousel";
import RecentResults from "@/components/RecentResults";

const Index = () => {
  // Local placeholder for fixtures (empty array)
  const fixtures = [];

  return (
    <div className="min-h-screen bg-background">
      
      <div>
        <VideoHighlights />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 3 Teams - Full width on mobile/medium, 2 cols on large */}
          <div className="lg:col-span-2 lg:order-1 order-1">
            <TopThreeTeams />
          </div>

          {/* Top Scorers - Full width on mobile/medium, 1 col on large */}
          <div className="lg:order-2 order-2">
            <TopScorers />
          </div>

          {/* Recent Results - Full width on mobile/medium, 2 cols on large */}
          <div className="lg:col-span-2 lg:order-3 order-3">
            <RecentResults />
          </div>

          {/* Fixtures Carousel - Full width on mobile/medium, 1 col on large */}
          <div className="lg:order-4 order-4">
            <FixturesCarousel fixtures={fixtures} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
