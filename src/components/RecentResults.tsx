"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { getTeamLogo } from "@/utils/teamLogos";
import { useSeason } from "@/hooks/contexts/SeasonContext";
import { useCompetition } from "../lib/CompetitionProvider";
import client from "@/lib/sanityClient";

interface Result {
  _id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string | null;
  awayTeamLogo?: string | null;
  homeScore: number;
  awayScore: number;
  status: string;
  matchDate: string;
}

export default function RecentResults() {
  const { selectedSeason } = useSeason();
  const { selectedCompetition } = useCompetition();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedSeason?._id || !selectedCompetition?._id) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await client.fetch(
          `*[_type == "fixture" 
            && season._ref == $seasonId 
            && competition._ref == $competitionId 
            && status == "completed"] 
            | order(matchDate desc)[0..4]{
              _id,
              homeTeam->{name, logo{asset->{url}}},
              awayTeam->{name, logo{asset->{url}}},
              homeScore,
              awayScore,
              status,
              matchDate
          }`,
          {
            seasonId: selectedSeason._id,
            competitionId: selectedCompetition._id,
          }
        );

        const formattedResults: Result[] = data.map((match: any) => ({
          _id: match._id,
          homeTeam: match.homeTeam?.name || "Unknown",
          awayTeam: match.awayTeam?.name || "Unknown",

          // ✅ CORRECT: Extract real Sanity URL
          homeTeamLogo:
            match.homeTeam?.logo?.asset?.url ||
            getTeamLogo(match.homeTeam?.name),

          awayTeamLogo:
            match.awayTeam?.logo?.asset?.url ||
            getTeamLogo(match.awayTeam?.name),

          homeScore: match.homeScore ?? 0,
          awayScore: match.awayScore ?? 0,
          status: match.status ?? "completed",
          matchDate: match.matchDate,
        }));

        setResults(formattedResults);
      } catch (error) {
        console.error("Error fetching recent results:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [selectedSeason, selectedCompetition]);

  if (loading)
    return (
      <p className="text-center py-4 text-muted-foreground text-sm">
        Loading recent results...
      </p>
    );

  return (
    <Card className="bg-elite-card border dark:border-border/50">
      <CardHeader>
        <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-primary flex items-center">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
            Recent Results
          </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
          {results.length > 0 ? (
            results.map((result) => (
              <Link
                key={result._id}
                to={`/match/${result._id}`}
                className="block p-2.5 sm:p-3.5 md:p-4 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors"
              >
                {/* Status + Date */}
                <div className="flex flex-wrap items-center justify-between mb-1.5 sm:mb-2 gap-2">
                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                    {result.status.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    {result.matchDate
                      ? new Date(result.matchDate).toLocaleDateString()
                      : "TBD"}
                  </span>
                </div>

                {/* Teams + Score */}
                <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm md:text-base gap-1.5 sm:gap-2 md:gap-3">
                  
                  {/* Home Team */}
                  <div className="flex items-center space-x-1.5 sm:space-x-2 w-full sm:w-1/3 justify-start">
                    <img
                      src={result.homeTeamLogo || getTeamLogo(result.homeTeam)}
                      alt={result.homeTeam}
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getTeamLogo(result.homeTeam);
                      }}
                    />
                    <p className="font-medium truncate max-w-[80px] sm:max-w-[120px] md:max-w-[140px]">
                      {result.homeTeam}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-center w-full sm:w-1/3 flex justify-center">
                    <div className="text-sm sm:text-base md:text-lg font-bold">
                      {result.homeScore} - {result.awayScore}
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center space-x-1.5 sm:space-x-2 w-full sm:w-1/3 justify-end">
                    <p className="font-medium truncate text-right max-w-[80px] sm:max-w-[120px] md:max-w-[140px]">
                      {result.awayTeam}
                    </p>
                    <img
                      src={result.awayTeamLogo || getTeamLogo(result.awayTeam)}
                      alt={result.awayTeam}
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getTeamLogo(result.awayTeam);
                      }}
                    />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-xs sm:text-sm text-muted-foreground text-center py-3">
              No recent results available.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
