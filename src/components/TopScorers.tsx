"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTeamLogo } from "@/utils/teamLogos";
import { useSeason } from "@/hooks/contexts/SeasonContext";
import { useCompetition } from "../lib/CompetitionProvider";
import client from "@/lib/sanityClient";
import { Calendar, Goal } from "lucide-react";

// Types
interface GoalScorer {
  playerName: string;
  goals: number;
  team: {
    name: string;
    logo?: {
      asset?: {
        url: string;
      };
    };
  } | null;
}

interface Player {
  name: string;
  team: string;
  logo_url: string | null;
  goals: number;
}

export default function TopScorers() {
  const { selectedSeason } = useSeason();
  const { selectedCompetition } = useCompetition();

  const [topScorers, setTopScorers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedSeason?._id || !selectedCompetition?._id) return;

    const fetchTopScorers = async () => {
      setLoading(true);

      try {
        const data = await client.fetch(
          `*[_type == "fixture" && season._ref == $seasonId && competition._ref == $competitionId && status == "completed"]{
            homeGoalScorers[]{
              playerName,
              goals,
              team->{name, logo{asset->{url}}}
            },
            awayGoalScorers[]{
              playerName,
              goals,
              team->{name, logo{asset->{url}}}
            }
          }`,
          {
            seasonId: selectedSeason._id,
            competitionId: selectedCompetition._id,
          }
        );

        const scorersMap: Record<string, Player> = {};

        data.forEach((fixture: any) => {
          const allGoals: GoalScorer[] = [
            ...(fixture.homeGoalScorers || []),
            ...(fixture.awayGoalScorers || []),
          ];

          allGoals.forEach((g) => {
            if (!g.playerName) return;

            const teamName = g.team?.name || "Unknown";

            const logoUrl =
              g.team?.logo?.asset?.url || getTeamLogo(teamName) || null;

            const key = `${g.playerName}-${teamName}`;

            if (!scorersMap[key]) {
              scorersMap[key] = {
                name: g.playerName,
                team: teamName,
                logo_url: logoUrl,
                goals: 0,
              };
            }

            scorersMap[key].goals += g.goals || 0;
          });
        });

        const sorted = Object.values(scorersMap)
          .sort((a, b) => b.goals - a.goals)
          .slice(0, 3);

        setTopScorers(sorted);
      } catch (err) {
        console.error("Error fetching top scorers:", err);
        setTopScorers([]);
      }

      setLoading(false);
    };

    fetchTopScorers();
  }, [selectedSeason, selectedCompetition]);

  if (loading)
    return (
      <p className="text-center py-6 text-muted-foreground text-sm">
        Loading top scorers...
      </p>
    );

  return (
    <Card className="bg-elite-card border dark:border-border/50">
      <CardHeader>
        <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-primary flex items-center">
        <Goal className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
          Top Scorers
          </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4">
        {topScorers.length > 0 ? (
          topScorers.map((player, idx) => (
            <div
              key={`${player.name}-${player.team}`}
              className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-[160px]">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                  {idx + 1}
                </span>

                {/* ✅ MAIN FIX — Avatar shows team logo, fallback shows initials */}
                <Avatar className="w-6 h-6">
                  <AvatarImage
                    src={player.logo_url ?? undefined}
                    alt={player.team}
                    className="object-contain w-full h-full   object-center"
                  />
                  <AvatarFallback className="text-xs bg-muted">
                    {player.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="truncate">
                  <p className="font-medium text-sm truncate max-w-[120px]">
                    {player.name}
                  </p>
                </div>
              </div>

              <div className="text-right pr-1">
                <p className="font-bold text-primary text-base">{player.goals}</p>
                
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">
            No scorers data available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
