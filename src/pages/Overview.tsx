import { useEffect, useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TopThreeTeams from "@/components/TopThreeTeams";
import TopScorers from "@/components/TopScorers";
import FixturesCarousel from "@/components/FixturesCarousel";
import RecentResults from "@/components/RecentResults";
import { useSeason } from "@/hooks/contexts/SeasonContext";
import { useCompetition } from "@/lib/CompetitionProvider";
import { fetchFixtures, calculateStandings } from "@/lib/standingsHelpers";
import { Fixture } from "@/lib/standingsHelpers"; // import the type

const Overview = () => {
  const { selectedSeason } = useSeason();
  const { loading: competitionLoading } = useCompetition();

  if (!selectedSeason) return <p className="text-center py-10">Select a season</p>;
  if (competitionLoading) return <p className="text-center py-10">Loading competitions...</p>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Pass props only if components accept them */}
            <TopThreeTeams  />
            <RecentResults  />
            <FixturesCarousel  />
          </div>

          <div className="space-y-6">
            <TopScorers />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
