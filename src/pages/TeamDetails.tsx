import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Calendar, Activity } from "lucide-react";
import { getTeamLogo } from "@/utils/teamLogos";
import { useSeason } from "@/hooks/contexts/SeasonContext";
import { useCompetition } from "@/lib/CompetitionProvider";
import client, { urlFor } from "@/lib/sanityClient";

type DBTeam = {
  id: string;
  name: string;
  logo_url?: string | null;
  managerName?: string | null;
  managerPhoto?: string | null;
};

type FixtureRow = {
  id: string;
  matchDate?: string | null;
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam?: { _id: string; name: string; logo?: string };
  awayTeam?: { _id: string; name: string; logo?: string };
  homeGoalScorers?: { playerName: string; goals: number; team?: { _id: string; name: string } }[];
  awayGoalScorers?: { playerName: string; goals: number; team?: { _id: string; name: string } }[];
};

type GoalScorer = {
  playerName: string;
  goals: number;
};

type TeamStats = {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  form: string;
};

const TeamDetails: React.FC = () => {
  const { teamName } = useParams<{ teamName: string }>();
  const { selectedSeason } = useSeason();
  const { selectedCompetition } = useCompetition();

  const [team, setTeam] = useState<DBTeam | null>(null);
  const [upcomingFixtures, setUpcomingFixtures] = useState<FixtureRow[]>([]);
  const [recentResults, setRecentResults] = useState<FixtureRow[]>([]);
  const [topScorers, setTopScorers] = useState<GoalScorer[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamName || !selectedSeason?._id || !selectedCompetition?._id) return;

    const fetchTeamData = async () => {
      setLoading(true);
      try {
        const fixtures: FixtureRow[] = await client.fetch(
          `*[_type == "fixture" && season._ref == $seasonId && competition._ref == $competitionId]{
            _id,
            matchDate,
            status,
            homeScore,
            awayScore,
            homeTeam->{_id, name, logo},
            awayTeam->{_id, name, logo},
            homeGoalScorers[]{
              playerName,
              goals,
              team->{_id, name}
            },
            awayGoalScorers[]{
              playerName,
              goals,
              team->{_id, name}
            }
          }`,
          { seasonId: selectedSeason._id, competitionId: selectedCompetition._id }
        );

        // Normalize team name for search (convert URL slug back to name format)
        const normalizedTeamName = teamName.toLowerCase().replace(/-/g, ' ');
        
        // Fetch team document directly by name (case-insensitive search)
        const teamDoc = await client.fetch(
          `*[_type == "team" && $seasonId in seasons[]._ref && (lower(name) match $teamName || lower(name) match $teamNameSlug)][0]{
            _id,
            name,
            logo,
            managerName,
            managerPhoto
          }`,
          { 
            seasonId: selectedSeason._id,
            teamName: `*${normalizedTeamName}*`,
            teamNameSlug: `*${teamName.replace(/-/g, ' ')}*`
          }
        );

        if (!teamDoc) {
          setLoading(false);
          return;
        }

        const foundTeam: DBTeam = {
          id: teamDoc._id,
          name: teamDoc.name,
          logo_url: teamDoc.logo,
          managerName: teamDoc.managerName,
          managerPhoto: teamDoc.managerPhoto
        };
        setTeam(foundTeam);

        const teamFixtures = fixtures.filter(f =>
          f.homeTeam?._id === foundTeam.id || f.awayTeam?._id === foundTeam.id
        );

        const completed = teamFixtures.filter(f => f.status === "completed");
        const scheduled = teamFixtures
          .filter(f => f.status === "scheduled" && f.matchDate && new Date(f.matchDate) > new Date())
          .sort((a, b) => new Date(a.matchDate!).getTime() - new Date(b.matchDate!).getTime());

        let won = 0, drawn = 0, lost = 0;
        const formArray: string[] = [];
        const scorersMap = new Map<string, number>();

        completed.forEach(f => {
          const isHome = f.homeTeam?._id === foundTeam.id;
          const teamScore = isHome ? (f.homeScore ?? 0) : (f.awayScore ?? 0);
          const oppScore = isHome ? (f.awayScore ?? 0) : (f.homeScore ?? 0);

          if (teamScore > oppScore) { won++; formArray.unshift('W'); }
          else if (teamScore < oppScore) { lost++; formArray.unshift('L'); }
          else { drawn++; formArray.unshift('D'); }

          // Process goal scorers from homeGoalScorers or awayGoalScorers
          const teamScorers = isHome ? f.homeGoalScorers : f.awayGoalScorers;
          teamScorers?.forEach((gs: any) => {
            if (gs && gs.playerName) {
              const goals = gs.goals || 1;
              scorersMap.set(gs.playerName, (scorersMap.get(gs.playerName) || 0) + goals);
            }
          });
        });

        setStats({
          played: completed.length,
          won,
          drawn,
          lost,
          points: won * 3 + drawn,
          form: formArray.slice(0, 5).join('')
        });

        setUpcomingFixtures(scheduled.slice(0, 5));
        setRecentResults(completed
          .sort((a, b) => new Date(b.matchDate!).getTime() - new Date(a.matchDate!).getTime())
          .slice(0, 5)
        );

        const top = Array.from(scorersMap.entries())
          .map(([playerName, goals]) => ({ playerName, goals }))
          .sort((a, b) => b.goals - a.goals)
          .slice(0, 5);
        setTopScorers(top);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamName, selectedSeason, selectedCompetition]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!team) return <div className="min-h-screen flex items-center justify-center">Team not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/teams">
          <Button variant="outline" className="mb-4 flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Teams
          </Button>
        </Link>

        {/* Team Header */}
        <Card className="bg-elite-card border-border/50 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-6">
              {/* Left side - Team logo, name, form and wins */}
              <div className="flex items-center gap-6 flex-1">
                <img
                  src={team.logo_url ? urlFor(team.logo_url).url() : getTeamLogo(team.name)}
                  alt={team.name}
                  className="w-20 h-20 object-contain"
                />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-3">{team.name}</h1>
                  
                  {/* Form and Wins */}
                  <div className="flex items-center gap-4 flex-wrap">
                    {stats?.form && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Form:</span>
                        <div className="flex items-center gap-1">
                          {stats.form.split('').map((r, i) => (
                            <span 
                              key={i} 
                              className={`w-7 h-7 flex items-center justify-center rounded-full text-white text-xs font-bold ${
                                r === 'W' ? 'bg-green-600' : r === 'D' ? 'bg-yellow-500' : 'bg-red-600'
                              }`}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {stats && (
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-sm font-semibold">
                          Wins: {stats.won}
                        </Badge>
                        <Badge variant="outline" className="text-sm">
                          P: {stats.played} | Pts: {stats.points}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side - Manager/Coach Info */}
              {(team.managerName || team.managerPhoto) && (
                <div className="flex flex-col items-center space-y-3 min-w-[120px]">
                  {team.managerPhoto ? (
                    <img
                      src={urlFor(team.managerPhoto).url()}
                      alt={team.managerName || "Manager"}
                      className="w-24 h-24 rounded-full object-cover border-2 border-border shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                      <span className="text-2xl">👤</span>
                    </div>
                  )}
                  {team.managerName && (
                    <div className="text-center">
                      <p className="text-base font-semibold">{team.managerName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {team.managerName ? "Head Coach" : "Manager"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fixtures and Top Scorers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Results - Scores */}
          <Card className="bg-elite-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentResults.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent results</p>
              ) : (
                recentResults.map(f => {
                  const isHome = f.homeTeam?._id === team.id;
                  const teamScore = isHome ? (f.homeScore ?? 0) : (f.awayScore ?? 0);
                  const oppScore = isHome ? (f.awayScore ?? 0) : (f.homeScore ?? 0);
                  const opponent = isHome ? f.awayTeam : f.homeTeam;
                  
                  return (
                    <Link key={f.id} to={`/match/${f.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <img
                            src={opponent?.logo ? urlFor(opponent.logo).url() : getTeamLogo(opponent?.name || "")}
                            alt={opponent?.name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src = getTeamLogo(opponent?.name || "");
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {isHome ? "vs" : "@"} {opponent?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {f.matchDate ? new Date(f.matchDate).toLocaleDateString() : 'TBD'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${teamScore > oppScore ? 'text-green-600' : teamScore < oppScore ? 'text-red-600' : 'text-yellow-600'}`}>
                            {teamScore} - {oppScore}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Upcoming Fixtures */}
          <Card className="bg-elite-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Upcoming Fixtures
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingFixtures.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming fixtures</p>
              ) : (
                upcomingFixtures.map(f => {
                  const isHome = f.homeTeam?._id === team.id;
                  const opponent = isHome ? f.awayTeam : f.homeTeam;
                  
                  return (
                    <Link key={f.id} to={`/match/${f.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <img
                            src={opponent?.logo ? urlFor(opponent.logo).url() : getTeamLogo(opponent?.name || "")}
                            alt={opponent?.name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src = getTeamLogo(opponent?.name || "");
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {isHome ? "vs" : "@"} {opponent?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {f.matchDate 
                                ? new Date(f.matchDate).toLocaleDateString() + ' ' + new Date(f.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'TBD'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {f.status?.toUpperCase() || 'SCHEDULED'}
                        </Badge>
                      </div>
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Top Scorers */}
          <Card className="bg-elite-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center"><Trophy className="w-5 h-5 mr-2"/>Top Scorers</CardTitle>
            </CardHeader>
            <CardContent>
              {topScorers.length === 0 ? <p className="text-sm text-muted-foreground">No top scorers</p> :
                topScorers.map((s, i) => (
                  <div key={s.playerName} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <div>{s.playerName}</div>
                    <Badge variant="outline">{s.goals} goals</Badge>
                  </div>
                ))
              }
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;
