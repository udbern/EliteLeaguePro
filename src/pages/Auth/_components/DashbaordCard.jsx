import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Calendar, Play, Users, TrendingUp, CheckCircle, Clock, Newspaper } from "lucide-react";
import client from "@/lib/sanityClient";

const DashboardOverview = () => {
  const [teams, setTeams] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [videos, setVideos] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch teams
        const teamFixtures = await client.fetch(
          `*[_type=="fixture"]{
            homeTeam->{_id, name, logo},
            awayTeam->{_id, name, logo}
          }`
        );

        const teamsMap = new Map();
        teamFixtures.forEach(fixture => {
          if (fixture.homeTeam) {
            teamsMap.set(fixture.homeTeam._id, {
              id: fixture.homeTeam._id,
              name: fixture.homeTeam.name,
              logo: fixture.homeTeam.logo
            });
          }
          if (fixture.awayTeam) {
            teamsMap.set(fixture.awayTeam._id, {
              id: fixture.awayTeam._id,
              name: fixture.awayTeam.name,
              logo: fixture.awayTeam.logo
            });
          }
        });

        setTeams(Array.from(teamsMap.values()));

        // Fetch fixtures
        const fixturesData = await client.fetch(
          `*[_type=="fixture"]{
            _id,
            homeTeam->{name},
            awayTeam->{name},
            status,
            homeScore,
            awayScore
          }`
        );
        setFixtures(fixturesData);

        // Fetch videos
        const videosData = await client.fetch(
          `*[_type=="videoHighlight"]`
        );
        setVideos(videosData);

        // Fetch news
        const newsData = await client.fetch(
          `*[_type=="news"]`
        );
        setNews(newsData);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setTeams([]);
        setFixtures([]);
        setVideos([]);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Stats calculations
  const fixtureStats = useMemo(() => {
    const completed = fixtures.filter(f => f.status === "completed").length;
    const scheduled = fixtures.filter(f => f.status === "scheduled").length;
    const inProgress = fixtures.filter(f => f.status === "in-progress").length;
    return { completed, scheduled, inProgress, total: fixtures.length };
  }, [fixtures]);

  const totalGoals = useMemo(() => {
    return fixtures.reduce((sum, f) => sum + (f.homeScore || 0) + (f.awayScore || 0), 0);
  }, [fixtures]);

  const StatCard = ({ icon: Icon, title, value, subtitle, iconColor = "text-primary" }) => (
    <Card className="glass-card border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {value}
            </h2>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg bg-primary/10`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Overview Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={Users} title="Total Teams" value={teams.length} subtitle="Registered teams" iconColor="text-blue-500" />
          <StatCard icon={Calendar} title="Total Fixtures" value={fixtureStats.total} subtitle="All matches" iconColor="text-green-500" />
          <StatCard icon={Play} title="Video Highlights" value={videos.length} subtitle="Uploaded videos" iconColor="text-purple-500" />
          <StatCard icon={Newspaper} title="News Articles" value={news.length} subtitle="Published articles" iconColor="text-red-500" />
          <StatCard icon={Trophy} title="Total Goals" value={totalGoals} subtitle="Season goals" iconColor="text-yellow-500" />
        </div>
      </div>

      {/* Fixture Breakdown */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" /> Fixture Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={CheckCircle} title="Completed" value={fixtureStats.completed} subtitle={`${((fixtureStats.completed / fixtureStats.total) * 100 || 0).toFixed(0)}% of total`} iconColor="text-green-500" />
          <StatCard icon={Clock} title="Scheduled" value={fixtureStats.scheduled} subtitle={`${((fixtureStats.scheduled / fixtureStats.total) * 100 || 0).toFixed(0)}% of total`} iconColor="text-blue-500" />
          <StatCard icon={Play} title="In Progress" value={fixtureStats.inProgress} subtitle="Live matches" iconColor="text-orange-500" />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
