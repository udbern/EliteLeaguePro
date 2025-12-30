import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, ArrowUpAZ } from "lucide-react";
import { Link } from "react-router-dom";
import { getTeamLogo } from "@/utils/teamLogos";
import { useSeason } from "@/hooks/contexts/SeasonContext";
import { useCompetition } from "../lib/CompetitionProvider";
import client, { urlFor } from "@/lib/sanityClient";
import { useState, useEffect } from "react";

const iconForPosition = (pos: number) =>
  pos === 1 ? Trophy : pos === 2 ? Medal : Award;

interface Team {
  position: number;
  team_name: string;
  logo_url?: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
}

export default function TopThreeTeams() {
  const { selectedSeason } = useSeason();
  const { selectedCompetition } = useCompetition();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedSeason?._id || !selectedCompetition?._id) return;

    const fetchTopTeams = async () => {
      setLoading(true);

      try {
        const matches = await client.fetch(
          `*[_type == "fixture" 
            && season._ref == $seasonId 
            && competition._ref == $competitionId 
            && status == "completed"
          ]{
            homeTeam->{_id, name, logo},
            awayTeam->{_id, name, logo},
            homeScore,
            awayScore
          }`,
          {
            seasonId: selectedSeason._id,
            competitionId: selectedCompetition._id,
          }
        );

        const statsMap: Record<string, Team> = {};

        const ensureTeam = (team: any) => {
          if (!statsMap[team._id]) {
            statsMap[team._id] = {
              position: 0,
              team_name: team.name,
              logo_url: team.logo ? urlFor(team.logo).url() : null,
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              points: 0,
            };
          }
        };

        matches.forEach((match: any) => {
          const home = match.homeTeam;
          const away = match.awayTeam;

          ensureTeam(home);
          ensureTeam(away);

          statsMap[home._id].played++;
          statsMap[away._id].played++;

          if (match.homeScore > match.awayScore) {
            statsMap[home._id].won++;
            statsMap[home._id].points += 3;
            statsMap[away._id].lost++;
          } else if (match.homeScore < match.awayScore) {
            statsMap[away._id].won++;
            statsMap[away._id].points += 3;
            statsMap[home._id].lost++;
          } else {
            statsMap[home._id].drawn++;
            statsMap[away._id].drawn++;
            statsMap[home._id].points++;
            statsMap[away._id].points++;
          }
        });

        const sortedTeams = Object.values(statsMap)
          .sort((a, b) => b.points - a.points)
          .slice(0, 3)
          .map((team, index) => ({ ...team, position: index + 1 }));

        setTeams(sortedTeams);
      } catch (error) {
        console.error("Error fetching top teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopTeams();
  }, [selectedSeason?._id, selectedCompetition?._id]);

  if (loading)
    return (
      <p className="text-center py-6 text-sm">Loading top teams...</p>
    );

  if (teams.length === 0)
    return (
      <Card className="bg-elite-card border dark:border-border/50">
        <CardHeader>
          <CardTitle>Top 3 Teams</CardTitle>
        </CardHeader>
        <CardContent>No standings available</CardContent>
      </Card>
    );

  return (
    <Card className="bg-elite-card border dark:border-border/50">
      <CardHeader>
        <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-primary flex items-center">
          <ArrowUpAZ className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
          Top 3 Teams
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {teams.map((team) => {
          const IconComponent = iconForPosition(team.position);

          return (
            <Link
              key={team.team_name}
              to={`/team/${team.team_name.toLowerCase().replace(/\s+/g, "-")}`}
              className="block hover:bg-muted/30 rounded-lg p-3 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconComponent className="w-5 h-5" />

                  <img
                    src={team.logo_url || getTeamLogo(team.team_name)}
                    alt={team.team_name}
                    className="w-6 h-6"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getTeamLogo(
                        team.team_name
                      );
                    }}
                  />

                  <span className="font-semibold">{team.team_name}</span>
                </div>

                <Badge variant="secondary">{team.points} pts</Badge>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
