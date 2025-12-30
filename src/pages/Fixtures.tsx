import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import client, { urlFor } from "@/lib/sanityClient";
import { getTeamLogo } from "@/utils/teamLogos";
import { useSeason } from "@/hooks/contexts/SeasonContext";
import { useCompetition } from "@/lib/CompetitionProvider";

type TeamRef = {
  name: string;
  logo_url?: string | null;
} | null;

type FixtureItem = {
  _id: string;
  matchDate?: string;
  round?: string;
  status?: "scheduled" | "in-progress" | "completed" | "postponed" | "cancelled";
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
};

const FixturesPage: React.FC = () => {
  const { selectedSeason } = useSeason();
  const { selectedCompetition } = useCompetition();

  const [availableRounds, setAvailableRounds] = useState<string[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [fixtures, setFixtures] = useState<FixtureItem[]>([]);

  // ---------------- Fetch Available Rounds ----------------
  useEffect(() => {
    if (!selectedSeason?._id || !selectedCompetition?._id) return;

    const fetchRounds = async () => {
      try {
        const rounds: string[] = await client.fetch(
          `*[_type=="fixture" 
            && season._ref==$seasonId 
            && competition._ref==$competitionId 
            && defined(round)
          ].round`,
          {
            seasonId: selectedSeason._id,
            competitionId: selectedCompetition._id,
          }
        );

        const uniqueRounds = Array.from(new Set(rounds || []))
          .filter(Boolean)
          .sort((a, b) => {
            const aNum = parseInt(a.replace(/\D/g, "")) || 0;
            const bNum = parseInt(b.replace(/\D/g, "")) || 0;
            return aNum - bNum;
          });

        setAvailableRounds(uniqueRounds);
        setCurrentRoundIndex(0);
      } catch (err) {
        console.error("Error fetching rounds:", err);
      }
    };

    fetchRounds();
  }, [selectedSeason, selectedCompetition]);

  const selectedRound = availableRounds[currentRoundIndex];

  // ---------------- Fetch Fixtures for Selected Round ----------------
  useEffect(() => {
    if (!selectedRound || !selectedSeason?._id || !selectedCompetition?._id) return;

    const fetchFixturesData = async () => {
      try {
        const data = await client.fetch(
          `*[_type=="fixture" 
            && round==$round
            && season._ref==$seasonId
            && competition._ref==$competitionId
          ]
          | order(matchDate asc){
            _id,
            matchDate,
            round,
            status,
            homeScore,
            awayScore,
            homeTeam->{name, logo},
            awayTeam->{name, logo}
          }`,
          {
            round: selectedRound,
            seasonId: selectedSeason._id,
            competitionId: selectedCompetition._id,
          }
        );

        const mapped: FixtureItem[] = data.map((f: any) => ({
          _id: f._id,
          matchDate: f.matchDate,
          round: f.round,
          status: f.status,
          homeScore: f.homeScore,
          awayScore: f.awayScore,

          homeTeam: f.homeTeam
            ? {
                name: f.homeTeam.name,
                logo_url: f.homeTeam.logo ? urlFor(f.homeTeam.logo).url() : null,
              }
            : null,

          awayTeam: f.awayTeam
            ? {
                name: f.awayTeam.name,
                logo_url: f.awayTeam.logo ? urlFor(f.awayTeam.logo).url() : null,
              }
            : null,
        }));

        setFixtures(mapped);
      } catch (err) {
        console.error("Error fetching fixtures:", err);
      }
    };

    fetchFixturesData();
  }, [selectedRound, selectedSeason, selectedCompetition]);

  const prevRound = () =>
    setCurrentRoundIndex((prev) => Math.max(prev - 1, 0));

  const nextRound = () =>
    setCurrentRoundIndex((prev) =>
      Math.min(prev + 1, availableRounds.length - 1)
    );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h1 className="text-lg sm:text-2xl font-semibold mb-6 text-center sm:text-left">
          Fixtures - {selectedSeason?.name || "Loading..."}
        </h1>

        {/* Round Selector */}
        <div className="flex items-center justify-between w-full gap-2 mb-6">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={prevRound}
            disabled={currentRoundIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Select
            value={selectedRound || ""}
            onValueChange={(val) =>
              setCurrentRoundIndex(availableRounds.indexOf(val))
            }
          >
            <SelectTrigger className="border border-border w-[150px] sm:w-[180px] text-[11px] sm:text-sm font-medium bg-elite-card">
              <SelectValue placeholder="Select Round" />
            </SelectTrigger>

            <SelectContent>
              {availableRounds.map((round) => (
                <SelectItem key={round} value={round}>
                  {round}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={nextRound}
            disabled={currentRoundIndex === availableRounds.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Fixture List */}
        <div className="grid gap-3 sm:gap-4">
          {fixtures.length > 0 ? (
            fixtures.map((match) => {
              const matchDate = match.matchDate ? new Date(match.matchDate) : null;

              const formattedDate = matchDate
                ? matchDate.toLocaleDateString()
                : "TBD";

              const formattedTime = matchDate
                ? matchDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "TBD";

              return (
                <Card
                  key={match._id}
                  className="bg-elite-card border border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <CardContent className="p-3 sm:p-4">
                    <Link to={`/match/${match._id}`} className="block">
                      <div className="flex flex-col items-center text-[11px] sm:text-sm">
                        <span className="mb-2 text-[10px] md:text-[12px] opacity-50">
                          {formattedDate}
                        </span>

                        <div className="flex items-center justify-between w-full gap-2 sm:gap-4">
                          {/* Home Team */}
                          <div className="flex items-center justify-center flex-1 gap-2 truncate">
                            <img
                              src={
                                match.homeTeam?.logo_url ||
                                getTeamLogo(match.homeTeam?.name || "")
                              }
                              alt={match.homeTeam?.name || "Home"}
                              className="w-6 h-6"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.src = getTeamLogo(match.homeTeam?.name || "");
                              }}
                            />
                            <span className="font-medium truncate">
                              {match.homeTeam?.name}
                            </span>
                          </div>

                          {/* Score / Time */}
                          <div className="text-center w-20 sm:w-24 font-semibold flex flex-col items-center">
                            {match.status === "completed" ? (
                              <span className="text-xl">
                                {match.homeScore ?? 0} - {match.awayScore ?? 0}
                              </span>
                            ) : (
                              <span className="text-[10px] sm:text-xs text-muted-foreground">
                                {formattedTime}
                              </span>
                            )}
                          </div>

                          {/* Away Team */}
                          <div className="flex items-center justify-center flex-1 gap-2 truncate">
                            <span className="font-medium truncate">
                              {match.awayTeam?.name}
                            </span>
                            <img
                              src={
                                match.awayTeam?.logo_url ||
                                getTeamLogo(match.awayTeam?.name || "")
                              }
                              alt={match.awayTeam?.name || "Away"}
                              className="w-6 h-6"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.src = getTeamLogo(match.awayTeam?.name || "");
                              }}
                            />
                          </div>
                        </div>

                        {/* Status */}
                        <div className="mt-2 text-[10px] sm:text-xs">
                          <Badge
                            variant={
                              match.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                            className="text-[9px] sm:text-[11px]"
                          >
                            {match.status?.toUpperCase() || "SCHEDULED"}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No fixtures available for this round
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FixturesPage;
