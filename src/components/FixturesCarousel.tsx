"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTeamLogo } from "@/utils/teamLogos";
import { Link } from "react-router-dom";
import sanityClient, { urlFor } from "@/lib/sanityClient";
import { useSeason } from "@/hooks/contexts/SeasonContext";
import { useCompetition } from "@/lib/CompetitionProvider";

// ----------------------------
// Types
// -----------------------------
type TeamRef = { name: string; logo?: string | null } | null | undefined;

export type FixtureItem = {
  _id: string;
  matchDate?: string | null;
  homeTeam?: TeamRef;
  awayTeam?: TeamRef;
  venue?: string;
  status?: string;
};

// -----------------------------
// Component
// -----------------------------
const FixturesCarousel = () => {
  const { selectedSeason } = useSeason();
  const { selectedCompetition } = useCompetition();
  const [fixtures, setFixtures] = useState<FixtureItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Fetch fixtures from Sanity
  // -----------------------------
  useEffect(() => {
    console.log("selectedSeason:", selectedSeason);
    console.log("selectedCompetition:", selectedCompetition);
    if (!selectedSeason?._id || !selectedCompetition?._id) {
      setFixtures([]);
      return;
    }

    const fetchFixtures = async () => {
      setLoading(true);
      try {
        const data = await sanityClient.fetch<FixtureItem[]>(
          `*[_type == "fixture"
            && season._ref == $seasonId
            && competition._ref == $competitionId
            && status == "scheduled"] | order(matchDate asc){
            _id,
            matchDate,
            status,
            venue,
            homeTeam->{name, logo},
            awayTeam->{name, logo}
          }`,
          {
            seasonId: selectedSeason._id,
            competitionId: selectedCompetition._id,
          }
        );

        console.log("Fetched fixtures data:", data);

        setFixtures(data);
      } catch (err) {
        console.error("Error fetching fixtures:", err);
        setFixtures([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFixtures();
  }, [selectedSeason, selectedCompetition]);

  const count = fixtures.length;
  const currentFixture = count > 0 ? fixtures[currentIndex] : null;

  const nextFixture = () => setCurrentIndex((prev) => (prev + 1) % count);
  const prevFixture = () => setCurrentIndex((prev) => (prev - 1 + count) % count);

  if (loading) {
    return (
      <Card className="bg-elite-card border dark:border-border/50">
        <CardHeader>
          <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-primary flex items-center">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
            Upcoming Fixtures
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="text-xs sm:text-sm text-muted-foreground text-center py-8">
            Loading fixtures...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-elite-card border dark:border-border/50">
      <CardHeader>
        <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-primary flex items-center">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
          Upcoming Fixtures
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div />
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={prevFixture}
              disabled={count <= 1}
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={nextFixture}
              disabled={count <= 1}
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative h-[100px] sm:h-[120px] flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {currentFixture ? (
              <motion.div
                key={currentFixture._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="w-full"
              >
                <Link
                  to={`/match/${currentFixture._id}`}
                  className="block hover:bg-muted/30 rounded-lg p-3 sm:p-4 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm md:text-base">
                    {/* Home Team */}
                    <div className="flex items-center space-x-2 sm:space-x-3 w-1/3 justify-start">
                      <img
                        src={
                          currentFixture.homeTeam?.logo
                            ? urlFor(currentFixture.homeTeam.logo).url()
                            : getTeamLogo(currentFixture.homeTeam?.name || "")
                        }
                        alt={currentFixture.homeTeam?.name || "Home Team"}
                        className="w-6 h-6 sm:w-8 sm:h-8 object-contain object-center  rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getTeamLogo(currentFixture.homeTeam?.name || "");
                        }}
                      />
                      <span className="font-medium truncate w-[60px] sm:w-auto">
                        {currentFixture.homeTeam?.name || "Home"}
                      </span>
                    </div>

                    {/* Date + Status */}
                    <div className="text-center w-1/3">
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        {currentFixture.matchDate
                          ? new Date(currentFixture.matchDate).toLocaleDateString()
                          : "TBD"}
                      </div>
                      <div className="font-semibold text-[11px] sm:text-sm">
                        {currentFixture.matchDate
                          ? new Date(currentFixture.matchDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "TBD"}
                      </div>
                      <Badge variant="outline" className="mt-1 text-[10px] sm:text-xs">
                        {currentFixture.status?.toUpperCase() || "VS"}
                      </Badge>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center space-x-2 sm:space-x-3 w-1/3 justify-end">
                      <span className="font-medium truncate w-[60px] sm:w-auto text-right">
                        {currentFixture.awayTeam?.name || "Away"}
                      </span>
                      <img
                        src={
                          currentFixture.awayTeam?.logo
                            ? urlFor(currentFixture.awayTeam.logo).url()
                            : getTeamLogo(currentFixture.awayTeam?.name || "")
                        }
                        alt={currentFixture.awayTeam?.name || "Away Team"}
                        className="w-6 h-6"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getTeamLogo(currentFixture.awayTeam?.name || "");
                        }}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="no-fixtures"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs sm:text-sm text-muted-foreground"
              >
                No upcoming fixtures
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dots */}
        {count > 1 && (
          <div className="flex justify-center mt-3 sm:mt-4 space-x-1.5 sm:space-x-2">
            {fixtures.map((_, index) => (
              <button
                key={index}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-primary" : "bg-muted"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FixturesCarousel;
