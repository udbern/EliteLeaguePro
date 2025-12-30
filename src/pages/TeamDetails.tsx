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
  goalScorers?: { playerName: string; team: string }[];
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
            goalScorers[] { playerName, team }
          }`,
          { seasonId: selectedSeason._id, competitionId: selectedCompetition._id }
        );

        const normalizedTeamName = teamName.toLowerCase().replace(/\s+/g, '-');
        const foundTeamFixture = fixtures.find(f =>
          f.homeTeam?.name.toLowerCase().replace(/\s+/g, '-') === normalizedTeamName ||
          f.awayTeam?.name.toLowerCase().replace(/\s+/g, '-') === normalizedTeamName
        );
        if (!foundTeamFixture) {
          setLoading(false);
          return;
        }

        const teamId = foundTeamFixture.homeTeam?.name.toLowerCase().replace(/\s+/g, '-') === normalizedTeamName
          ? foundTeamFixture.homeTeam!._id
          : foundTeamFixture.awayTeam!._id;

        // Fetch team document to get manager information
        const teamDoc = await client.fetch(
          `*[_type == "team" && _id == $teamId][0]{
            _id,
            name,
            logo,
            managerName,
            managerPhoto
          }`,
          { teamId }
        );

        const foundTeam: DBTeam = {
          id: teamId,
          name: teamDoc?.name || foundTeamFixture.homeTeam?.name.toLowerCase().replace(/\s+/g, '-') === normalizedTeamName
            ? foundTeamFixture.homeTeam!.name
            : foundTeamFixture.awayTeam!.name,
          logo_url: teamDoc?.logo || foundTeamFixture.homeTeam?.name.toLowerCase().replace(/\s+/g, '-') === normalizedTeamName
            ? foundTeamFixture.homeTeam!.logo
            : foundTeamFixture.awayTeam?.logo,
          managerName: teamDoc?.managerName,
          managerPhoto: teamDoc?.managerPhoto
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

          f.goalScorers?.forEach(gs => {
            if (gs.team === foundTeam.name) {
              scorersMap.set(gs.playerName, (scorersMap.get(gs.playerName) || 0) + 1);
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
          <CardHeader>
            <div className="flex items-center justify-between">
              {/* Left side - Team logo, name, stats and form */}
              <div className="flex flex-col items-center space-y-4">
                <img
                  src={team.logo_url ? urlFor(team.logo_url).url() : getTeamLogo(team.name)}
                  alt={team.name}
                  className="w-24 h-24 object-contain"
                />
                <div className="text-center">
                  <h1 className="text-3xl font-bold">{team.name}</h1>
                  {stats && (
                    <div className="flex items-center justify-center space-x-3 mt-2">
                      <Badge variant="secondary">P: {stats.played}</Badge>
                      <Badge variant="secondary">W: {stats.won}</Badge>
                      <Badge variant="secondary">D: {stats.drawn}</Badge>
                      <Badge variant="secondary">L: {stats.lost}</Badge>
                      <Badge variant="secondary">Pts: {stats.points}</Badge>
                    </div>
                  )}
                  {stats?.form && (
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-sm text-muted-foreground">Form:</span>
                      {stats.form.split('').map((r, i) => (
                        <span key={i} className={`w-6 h-6 flex items-center justify-center rounded-full text-white text-xs font-bold ${r === 'W' ? 'bg-green-600' : r === 'D' ? 'bg-yellow-500' : 'bg-red-600'}`}>{r}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Manager Info */}
              {(team.managerName || team.managerPhoto) && (
                <div className="flex flex-col items-center space-y-2">
                  {team.managerPhoto && (
                    <img
                      src={urlFor(team.managerPhoto).url()}
                      alt={team.managerName || "Manager"}
                      className="w-20 h-20 rounded-full object-cover border-2 border-border"
                    />
                  )}
                  {team.managerName && (
                    <div className="text-center">
                      <p className="text-lg font-medium">{team.managerName}</p>
                      <p className="text-sm text-muted-foreground">Head Coach</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Fixtures and Top Scorers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming */}
          <Card className="bg-elite-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center"><Calendar className="w-5 h-5 mr-2"/>Upcoming Fixtures</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingFixtures.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming fixtures</p> :
                upcomingFixtures.map(f => (
                  <div key={f.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-2">
                      <img src={f.homeTeam?.logo ? urlFor(f.homeTeam.logo).url() : getTeamLogo(f.homeTeam?.name || "")} className="w-6 h-6" />
                      <span>{f.homeTeam?.name} vs {f.awayTeam?.name}</span>
                      <img src={f.awayTeam?.logo ? urlFor(f.awayTeam.logo).url() : getTeamLogo(f.awayTeam?.name || "")} className="w-6 h-6" />
                    </div>
                    <div className="text-sm">{f.matchDate ? new Date(f.matchDate).toLocaleDateString() : 'TBD'}</div>
                  </div>
                ))
              }
            </CardContent>
          </Card>

          {/* Recent */}
          <Card className="bg-elite-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center"><Activity className="w-5 h-5 mr-2"/>Recent Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentResults.length === 0 ? <p className="text-sm text-muted-foreground">No recent results</p> :
                recentResults.map(f => (
                  <div key={f.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-2">
                      <img src={f.homeTeam?.logo ? urlFor(f.homeTeam.logo).url() : getTeamLogo(f.homeTeam?.name || "")} className="w-6 h-6" />
                      <span>{f.homeTeam?.name} vs {f.awayTeam?.name}</span>
                      <img src={f.awayTeam?.logo ? urlFor(f.awayTeam.logo).url() : getTeamLogo(f.awayTeam?.name || "")} className="w-6 h-6" />
                    </div>
                    <div className="font-bold">{f.homeScore}-{f.awayScore}</div>
                  </div>
                ))
              }
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
