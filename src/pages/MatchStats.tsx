import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity, Target, Users } from "lucide-react";
import { getTeamLogo } from "@/utils/teamLogos";
import client, { urlFor } from "@/lib/sanityClient";

const MatchStats = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) return;

    const fetchMatch = async () => {
      setLoading(true);
      try {
        const data = await client.fetch(
          `*[_type=="fixture" && _id==$matchId][0]{
            _id,
            matchDate,
            status,
            venue,
            homeScore,
            awayScore,
            attendance,
            round,

            homeTeam->{_id, name, logo},
            awayTeam->{_id, name, logo},

            homeGoalScorers[]{
              playerName,
              goals,
              team->{_id, name, logo}
            },
            awayGoalScorers[]{
              playerName,
              goals,
              team->{_id, name, logo}
            },

            homeTeamStats{
              possession, shots, shotsOnTarget,
              corners, fouls, 
            },

            awayTeamStats{
              possession, shots, shotsOnTarget,
              corners, fouls,
            }
          }`,
          { matchId }
        );

        setMatch(data);
      } catch (error) {
        console.error("Error fetching match:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading match data...</h2>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Match not found</h2>
          <Link to="/fixtures">
            <Button>Back to Fixtures</Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats =
    match.homeTeamStats && match.awayTeamStats
      ? {
          possession: {
            home: match.homeTeamStats.possession,
            away: match.awayTeamStats.possession,
          },
          shots: {
            home: match.homeTeamStats.shots,
            away: match.awayTeamStats.shots,
          },
          shotsOnTarget: {
            home: match.homeTeamStats.shotsOnTarget,
            away: match.awayTeamStats.shotsOnTarget,
          },
          corners: {
            home: match.homeTeamStats.corners,
            away: match.awayTeamStats.corners,
          },
          fouls: {
            home: match.homeTeamStats.fouls,
            away: match.awayTeamStats.fouls,
          },
          
        }
      : {};

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/fixtures" className="inline-block mb-6">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Fixtures
          </Button>
        </Link>

        {/* Match Header */}
        <Card className="bg-elite-card border-border/50 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                {match.status?.toUpperCase() || "SCHEDULED"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {match.venue}
              </span>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between">
              {/* Home Team */}
              <div className="text-center flex-1">
                <img
                  src={
                    match.homeTeam?.logo
                      ? urlFor(match.homeTeam.logo).url()
                      : getTeamLogo(match.homeTeam.name)
                  }
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 object-contain"
                />
                <p className="font-semibold">{match.homeTeam.name}</p>
              </div>

              {/* Score */}
              <div className="text-center px-8">
                <div className="text-4xl font-bold">
                  <span className="text-primary">{match.homeScore ?? 0}</span>
                  <span className="text-muted-foreground mx-4">-</span>
                  <span className="text-primary">{match.awayScore ?? 0}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {match.matchDate
                    ? new Date(match.matchDate).toLocaleDateString()
                    : "TBD"}
                </p>
              </div>

              {/* Away Team */}
              <div className="text-center flex-1">
                <img
                  src={
                    match.awayTeam?.logo
                      ? urlFor(match.awayTeam.logo).url()
                      : getTeamLogo(match.awayTeam.name)
                  }
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 object-contain"
                />
                <p className="font-semibold">{match.awayTeam.name}</p>
              </div>
            </div>

            {/* Goal Scorers Section */}
            {((match.homeGoalScorers?.length > 0) ||
              (match.awayGoalScorers?.length > 0)) && (
              <div className="mt-6 pt-6 border-t border-border/50">
                <h3 className="text-sm font-semibold mb-3 text-center">Goal Scorers</h3>
                <div className="flex justify-between gap-4">
                  {/* Home Scorers */}
                  <div className="flex-1">
                    {match.homeGoalScorers?.length > 0 ? (
                      match.homeGoalScorers.map((s: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs sm:text-sm mb-2"
                        >
                          <span className="font-medium">{s.playerName}</span>
                          {s.goals > 1 && (
                            <Badge variant="secondary" className="ml-2">
                              {s.goals}
                            </Badge>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground text-center">No scorers</p>
                    )}
                  </div>

                  {/* Away Scorers */}
                  <div className="flex-1">
                    {match.awayGoalScorers?.length > 0 ? (
                      match.awayGoalScorers.map((s: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs sm:text-sm mb-2"
                        >
                          <span className="font-medium">{s.playerName}</span>
                          {s.goals > 1 && (
                            <Badge variant="secondary" className="ml-2">
                              {s.goals}
                            </Badge>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground text-center">No scorers</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Match Statistics */}
          <Card className="bg-elite-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Match Statistics
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats).map(([stat, values]: any) => (
                  <div key={stat} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{values.home}</span>
                      <span className="capitalize font-medium">
                        {stat.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span>{values.away}</span>
                    </div>

                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-l-full"
                        style={{
                          width: `${
                            (values.home / (values.home + values.away)) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goals Timeline */}
          <Card className="bg-elite-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Goal Scorers
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {/* Home Team Scorers */}
                {match.homeGoalScorers?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <img
                        src={
                          match.homeTeam?.logo
                            ? urlFor(match.homeTeam.logo).url()
                            : getTeamLogo(match.homeTeam?.name)
                        }
                        alt={match.homeTeam?.name}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = getTeamLogo(match.homeTeam?.name);
                        }}
                      />
                      <h4 className="font-semibold text-sm">{match.homeTeam?.name}</h4>
                    </div>
                    <div className="space-y-2">
                      {match.homeGoalScorers.map((scorer: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                        >
                          <span className="font-medium text-sm">{scorer.playerName}</span>
                          <Badge variant="outline" className="ml-2">
                            {scorer.goals} {scorer.goals === 1 ? "goal" : "goals"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Away Team Scorers */}
                {match.awayGoalScorers?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <img
                        src={
                          match.awayTeam?.logo
                            ? urlFor(match.awayTeam.logo).url()
                            : getTeamLogo(match.awayTeam?.name)
                        }
                        alt={match.awayTeam?.name}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = getTeamLogo(match.awayTeam?.name);
                        }}
                      />
                      <h4 className="font-semibold text-sm">{match.awayTeam?.name}</h4>
                    </div>
                    <div className="space-y-2">
                      {match.awayGoalScorers.map((scorer: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                        >
                          <span className="font-medium text-sm">{scorer.playerName}</span>
                          <Badge variant="outline" className="ml-2">
                            {scorer.goals} {scorer.goals === 1 ? "goal" : "goals"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Scorers Message */}
                {(!match.homeGoalScorers?.length && !match.awayGoalScorers?.length) && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No goal scorers recorded
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Extra Info */}
        <Card className="bg-elite-card border-border/50 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Match Information
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Venue</p>
                <p className="font-semibold">{match.venue}</p>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="font-semibold">
                  {match.attendance?.toLocaleString() || "TBD"}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold">
                  {match.matchDate
                    ? new Date(match.matchDate).toLocaleDateString()
                    : "TBD"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MatchStats;
