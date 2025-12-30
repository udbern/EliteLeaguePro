import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { SeasonProvider, useSeason } from "@/hooks/contexts/SeasonContext";
import { CompetitionProvider } from "./lib/CompetitionProvider";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";

import Index from "./pages/Index";
import Standings from "./pages/Standings";
import Fixtures from "./pages/Fixtures";
import Teams from "./pages/Teams";
import Admin from "./pages/Auth/Admin";
import Auth from "./pages/Auth/Auth";
import MatchStats from "./pages/MatchStats";
import TeamDetails from "./pages/TeamDetails";
import NotFound from "./pages/NotFound";
import NewsDetails from "./pages/NewsDetails";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const AppRoutes = () => {
  const { selectedSeason } = useSeason();

  return (
    <Routes>
      <Route path="/" element={<Index key={selectedSeason?._id || "none"} />} />
      <Route
        path="/standings"
        element={<Standings key={selectedSeason?._id || "none"} />}
      />
      <Route
        path="/fixtures"
        element={<Fixtures key={selectedSeason?._id || "none"} />}
      />
      <Route
        path="/teams"
        element={<Teams key={selectedSeason?._id || "none"} />}
      />
      <Route path="/admin" element={<Admin />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/match/:matchId" element={<MatchStats />} />
      <Route path="/team/:teamName" element={<TeamDetails />} />
      <Route path="/news/:slug" element={<NewsDetails />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AppLayout = () => {
  const location = useLocation();
  const isAdminPage =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/auth");

  return (
    <>
      {!isAdminPage && <Header />}
      <AppRoutes />
    </>
  );
};

const App = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="elite-league-theme">
        <AuthProvider>
          <SeasonProvider>
            <CompetitionProvider>
              <BrowserRouter>
                <AppLayout />
              </BrowserRouter>
            </CompetitionProvider>
          </SeasonProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
