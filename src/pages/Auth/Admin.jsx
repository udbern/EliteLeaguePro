import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useSeason } from "@/hooks/contexts/SeasonContext";
import { useCompetition } from "@/lib/CompetitionProvider";
import AdminSidebar from "./_components/Sidebar";
import DashboardOverview from "./_components/DashbaordCard";
import TeamsManager from "./_components/Teams";
import FixturesManager from "./_components/Fixtures";
import VideosManager from "./_components/Videos";
import NewsManager from "./_components/News";

const AdminDashboard = () => {
  const { toast } = useToast();
  const { selectedSeason } = useSeason();
  const { selectedCompetition } = useCompetition();
  const [activeTab, setActiveTab] = useState("analytics");

  // Local empty states — no fetching
  const [teams, setTeams] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [videos, setVideos] = useState([]);
  const [news, setNews] = useState([]);
  const [standings, setStandings] = useState([]);

  // Logout
  const handleLogout = () => {
    toast({ title: "Logged out" });
    window.location.href = "/auth";
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar */}
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="glass-card border-b border-border/50 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 backdrop-blur-sm p-4 sticky top-0 z-10 flex items-center gap-4">
            <SidebarTrigger className="hover:bg-primary/10 transition-colors" />
            <h1 className="text-2xl font-bold capitalize bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {activeTab}
            </h1>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {activeTab === "analytics" && (
              <DashboardOverview
                seasonId={selectedSeason?._id}
                competitionId={selectedCompetition?._id}
              />
            )}

            {activeTab === "teams" && <TeamsManager teams={teams} setTeams={setTeams} />}

            {activeTab === "fixtures" && (
              <FixturesManager fixtures={fixtures} setFixtures={setFixtures} />
            )}

            {activeTab === "videos" && <VideosManager videos={videos} setVideos={setVideos} />}

            {activeTab === "news" && <NewsManager news={news} setNews={setNews} />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
