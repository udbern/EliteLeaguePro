import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Pencil, Check, X, Calendar, ArrowUpDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getTeamLogo } from "@/utils/teamLogos";
import { useToast } from "@/hooks/use-toast";
import client, { urlFor } from "@/lib/sanityClient";

const FixturesManager = ({ fixtures, setFixtures }) => {
  const { toast } = useToast();

  const fieldClass =
    "h-11 rounded-lg bg-card/50 border-input/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/50 transition-colors";

  // Local teams state for fetched data
  const [fetchedFixtures, setFetchedFixtures] = useState([]);
  const [teams, setTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [newFixture, setNewFixture] = useState({
    homeTeam: "",
    awayTeam: "",
    season: "",
    competition: "",
    matchDate: "",
    venue: "",
    round: "",
    group: "",
    status: "scheduled",
    homeScore: "",
    awayScore: "",
  });

  // Edit form
  const [editingFixtureId, setEditingFixtureId] = useState(null);
  const [editFixture, setEditFixture] = useState({
    homeTeam: "",
    awayTeam: "",
    season: "",
    competition: "",
    matchDate: "",
    venue: "",
    round: "",
    group: "",
    status: "scheduled",
    homeScore: "",
    awayScore: "",
  });

  // UI state
  const [sortBy, setSortBy] = useState("matchDate"); // matchDate | homeTeam | awayTeam | status
  const [sortOrder, setSortOrder] = useState("asc");
  const [groupBy, setGroupBy] = useState("season"); // status | round | season | date | none
  const [search, setSearch] = useState("");

  // Fetch data from Sanity
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch fixtures
        const fixturesData = await client.fetch(
          `*[_type == "fixture"] | order(matchDate desc) {
            _id,
            homeTeam->{_id, name, shortName, logo},
            awayTeam->{_id, name, shortName, logo},
            season->{_id, name},
            competition->{_id, name},
            matchDate,
            venue,
            round,
            group,
            status,
            homeScore,
            awayScore
          }`
        );
        setFetchedFixtures(fixturesData);

        // Fetch teams
        const teamsData = await client.fetch(`*[_type == "team"]{_id, name, shortName}`);
        setTeams(teamsData);

        // Fetch seasons
        const seasonsData = await client.fetch(`*[_type == "season"]{_id, name}`);
        setSeasons(seasonsData);

        // Fetch competitions
        const competitionsData = await client.fetch(`*[_type == "competition"]{_id, name}`);
        setCompetitions(competitionsData);

      } catch (error) {
        console.error("Error fetching fixtures data:", error);
        toast({ title: "Error", description: "Failed to fetch fixtures data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Actions
  const addFixture = async () => {
    if (!newFixture.homeTeam || !newFixture.awayTeam || !newFixture.season || !newFixture.competition || !newFixture.matchDate) {
      return toast({ title: "Error", description: "Home team, away team, season, competition, and match date are required", variant: "destructive" });
    }
    if (newFixture.homeTeam === newFixture.awayTeam) {
      return toast({ title: "Error", description: "Home and away teams must be different", variant: "destructive" });
    }

    try {
      const payload = {
        _type: "fixture",
        homeTeam: { _type: "reference", _ref: newFixture.homeTeam },
        awayTeam: { _type: "reference", _ref: newFixture.awayTeam },
        season: { _type: "reference", _ref: newFixture.season },
        competition: { _type: "reference", _ref: newFixture.competition },
        matchDate: new Date(newFixture.matchDate).toISOString(),
        venue: newFixture.venue || null,
        round: newFixture.round || null,
        group: newFixture.group || null,
        status: newFixture.status,
        homeScore: newFixture.homeScore ? parseInt(newFixture.homeScore) : null,
        awayScore: newFixture.awayScore ? parseInt(newFixture.awayScore) : null,
      };

      const result = await client.create(payload);
      setFetchedFixtures((prev) => [result, ...prev]);
      setNewFixture({
        homeTeam: "",
        awayTeam: "",
        season: "",
        competition: "",
        matchDate: "",
        venue: "",
        round: "",
        group: "",
        status: "scheduled",
        homeScore: "",
        awayScore: "",
      });
      toast({ title: "Fixture added successfully" });
    } catch (error) {
      console.error("Error adding fixture:", error);
      toast({ title: "Error", description: "Failed to add fixture", variant: "destructive" });
    }
  };

  const startEdit = (fixture) => {
    setEditingFixtureId(fixture._id);
    setEditFixture({
      homeTeam: fixture.homeTeam?._id || "",
      awayTeam: fixture.awayTeam?._id || "",
      season: fixture.season?._id || "",
      competition: fixture.competition?._id || "",
      matchDate: fixture.matchDate ? new Date(fixture.matchDate).toISOString().slice(0, 16) : "",
      venue: fixture.venue || "",
      round: fixture.round || "",
      group: fixture.group || "",
      status: fixture.status || "scheduled",
      homeScore: fixture.homeScore?.toString() || "",
      awayScore: fixture.awayScore?.toString() || "",
    });
  };

  const cancelEdit = () => {
    setEditingFixtureId(null);
    setEditFixture({
      homeTeam: "",
      awayTeam: "",
      season: "",
      competition: "",
      matchDate: "",
      venue: "",
      round: "",
      group: "",
      status: "scheduled",
      homeScore: "",
      awayScore: "",
    });
  };

  const saveEdit = async () => {
    if (!editingFixtureId) return;
    if (!editFixture.homeTeam || !editFixture.awayTeam || !editFixture.season || !editFixture.competition || !editFixture.matchDate) {
      return toast({ title: "Error", description: "Home team, away team, season, competition, and match date are required", variant: "destructive" });
    }
    if (editFixture.homeTeam === editFixture.awayTeam) {
      return toast({ title: "Error", description: "Home and away teams must be different", variant: "destructive" });
    }

    try {
      const payload = {
        homeTeam: { _type: "reference", _ref: editFixture.homeTeam },
        awayTeam: { _type: "reference", _ref: editFixture.awayTeam },
        season: { _type: "reference", _ref: editFixture.season },
        competition: { _type: "reference", _ref: editFixture.competition },
        matchDate: new Date(editFixture.matchDate).toISOString(),
        venue: editFixture.venue || null,
        round: editFixture.round || null,
        group: editFixture.group || null,
        status: editFixture.status,
        homeScore: editFixture.homeScore ? parseInt(editFixture.homeScore) : null,
        awayScore: editFixture.awayScore ? parseInt(editFixture.awayScore) : null,
      };

      const result = await client.patch(editingFixtureId).set(payload).commit();
      setFetchedFixtures((prev) => prev.map((f) => (f._id === editingFixtureId ? result : f)));
      cancelEdit();
      toast({ title: "Fixture updated successfully" });
    } catch (error) {
      console.error("Error updating fixture:", error);
      toast({ title: "Error", description: "Failed to update fixture", variant: "destructive" });
    }
  };

  const deleteFixture = async (id) => {
    try {
      await client.delete(id);
      setFetchedFixtures((prev) => prev.filter((fixture) => fixture._id !== id));
      toast({ title: "Fixture deleted successfully" });
    } catch (error) {
      console.error("Error deleting fixture:", error);
      toast({ title: "Error", description: "Failed to delete fixture", variant: "destructive" });
    }
  };

  const toggleSortOrder = () => setSortOrder((s) => (s === "asc" ? "desc" : "asc"));

  // Derived data
  const filteredFixtures = useMemo(() => {
    const list = Array.isArray(fetchedFixtures) ? fetchedFixtures : [];
    const byName = search.trim().toLowerCase();
    const filtered = byName ? list.filter((f) => {
      const homeName = f.homeTeam?.name?.toLowerCase() || "";
      const awayName = f.awayTeam?.name?.toLowerCase() || "";
      const round = (f.round || "").toLowerCase();
      const status = (f.status || "").toLowerCase();
      return homeName.includes(byName) || awayName.includes(byName) || round.includes(byName) || status.includes(byName);
    }) : list;

    // Sort by selected criteria
    const sorted = [...filtered].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "homeTeam":
          aValue = a.homeTeam?.name || "";
          bValue = b.homeTeam?.name || "";
          break;
        case "awayTeam":
          aValue = a.awayTeam?.name || "";
          bValue = b.awayTeam?.name || "";
          break;
        case "status":
          aValue = a.status || "";
          bValue = b.status || "";
          break;
        case "matchDate":
        default:
          aValue = new Date(a.matchDate || 0);
          bValue = new Date(b.matchDate || 0);
          break;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [fetchedFixtures, search, sortBy, sortOrder]);

  const fixturesByStatus = useMemo(() => {
    const map = new Map();
    filteredFixtures.forEach((f) => {
      const key = f.status || "Unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(f);
    });
    return map;
  }, [filteredFixtures]);

  const fixturesByRound = useMemo(() => {
    const map = new Map();
    filteredFixtures.forEach((f) => {
      const key = f.round || "No Round";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(f);
    });
    return map;
  }, [filteredFixtures]);

  const fixturesBySeason = useMemo(() => {
    const map = new Map();
    filteredFixtures.forEach((f) => {
      const key = f.season?.name || "No Season";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(f);
    });
    return map;
  }, [filteredFixtures]);

  const fixturesByDate = useMemo(() => {
    const map = new Map();
    filteredFixtures.forEach((f) => {
      const date = new Date(f.matchDate);
      const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(f);
    });
    return map;
  }, [filteredFixtures]);

  // Render helpers
  const Section = ({ title, children }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children}
      </div>
    </div>
  );

  const FixtureCard = ({ fixture }) => (
    <div className="p-4 glass-card rounded-md border border-border/40 hover:border-primary/40 transition-colors">
      {editingFixtureId === fixture._id ? (
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Home Team</Label>
              <Select value={editFixture.homeTeam} onValueChange={(value) => setEditFixture({ ...editFixture, homeTeam: value })}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="Select home team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Away Team</Label>
              <Select value={editFixture.awayTeam} onValueChange={(value) => setEditFixture({ ...editFixture, awayTeam: value })}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="Select away team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Season</Label>
              <Select value={editFixture.season} onValueChange={(value) => setEditFixture({ ...editFixture, season: value })}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((season) => (
                    <SelectItem key={season._id} value={season._id}>
                      {season.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Competition</Label>
              <Select value={editFixture.competition} onValueChange={(value) => setEditFixture({ ...editFixture, competition: value })}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="Select competition" />
                </SelectTrigger>
                <SelectContent>
                  {competitions.map((comp) => (
                    <SelectItem key={comp._id} value={comp._id}>
                      {comp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Match Date & Time</Label>
              <Input
                type="datetime-local"
                value={editFixture.matchDate}
                onChange={(e) => setEditFixture({ ...editFixture, matchDate: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Venue</Label>
              <Input
                value={editFixture.venue}
                onChange={(e) => setEditFixture({ ...editFixture, venue: e.target.value })}
                className={fieldClass}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Round</Label>
              <Input
                value={editFixture.round}
                onChange={(e) => setEditFixture({ ...editFixture, round: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Group</Label>
              <Input
                value={editFixture.group}
                onChange={(e) => setEditFixture({ ...editFixture, group: e.target.value })}
                className={fieldClass}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={editFixture.status} onValueChange={(value) => setEditFixture({ ...editFixture, status: value })}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="postponed">Postponed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Home Score</Label>
              <Input
                type="number"
                value={editFixture.homeScore}
                onChange={(e) => setEditFixture({ ...editFixture, homeScore: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Away Score</Label>
              <Input
                type="number"
                value={editFixture.awayScore}
                onChange={(e) => setEditFixture({ ...editFixture, awayScore: e.target.value })}
                className={fieldClass}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={saveEdit} title="Save">
              <Check className="w-4 h-4" />
            </Button>
            <Button variant="ghost" onClick={cancelEdit} title="Cancel">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={fixture.homeTeam?.logo ? urlFor(fixture.homeTeam.logo).url() : getTeamLogo(fixture.homeTeam?.name)} alt={fixture.homeTeam?.name} className="w-8 h-8 rounded-full" />
              <div className="text-center">
                <div className="font-medium text-sm">{fixture.homeTeam?.name}</div>
                <div className="text-xs text-muted-foreground">{fixture.homeTeam?.shortName}</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {fixture.homeScore !== null && fixture.awayScore !== null ? `${fixture.homeScore} - ${fixture.awayScore}` : "vs"}
              </div>
              <Badge variant={fixture.status === "completed" ? "default" : fixture.status === "in-progress" ? "secondary" : "outline"} className="text-xs">
                {fixture.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="font-medium text-sm">{fixture.awayTeam?.name}</div>
                <div className="text-xs text-muted-foreground">{fixture.awayTeam?.shortName}</div>
              </div>
              <img src={fixture.awayTeam?.logo ? urlFor(fixture.awayTeam.logo).url() : getTeamLogo(fixture.awayTeam?.name)} alt={fixture.awayTeam?.name} className="w-8 h-8 rounded-full" />
            </div>
          </div>
          <div className="text-center text-xs text-muted-foreground">
            {fixture.matchDate ? new Date(fixture.matchDate).toLocaleDateString() : "No date"}
            {fixture.venue && ` • ${fixture.venue}`}
            {fixture.round && ` • Round ${fixture.round}`}
          </div>
          <div className="flex items-center justify-between gap-1">
            <Button variant="outline" size="icon" onClick={() => startEdit(fixture)} title="Edit">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => deleteFixture(fixture._id)} className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Delete">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Sections by grouping
  const renderContent = () => {
    if (groupBy === "status") {
      const entries = Array.from(fixturesByStatus.entries());
      return (
        <div className="space-y-8">
          {entries.map(([status, list]) => (
            <Section key={status} title={status.charAt(0).toUpperCase() + status.slice(1)}>
              {list.map((f) => (
                <FixtureCard key={f._id} fixture={f} />
              ))}
            </Section>
          ))}
        </div>
      );
    }

    if (groupBy === "round") {
      const entries = Array.from(fixturesByRound.entries());
      return (
        <div className="space-y-8">
          {entries.map(([round, list]) => (
            <Section key={round} title={round}>
              {list.map((f) => (
                <FixtureCard key={f._id} fixture={f} />
              ))}
            </Section>
          ))}
        </div>
      );
    }

    if (groupBy === "season") {
      const entries = Array.from(fixturesBySeason.entries());
      return (
        <div className="space-y-8">
          {entries.map(([season, list]) => (
            <Section key={season} title={season}>
              {list.map((f) => (
                <FixtureCard key={f._id} fixture={f} />
              ))}
            </Section>
          ))}
        </div>
      );
    }

    if (groupBy === "date") {
      const entries = Array.from(fixturesByDate.entries());
      return (
        <div className="space-y-8">
          {entries.map(([date, list]) => (
            <Section key={date} title={date}>
              {list.map((f) => (
                <FixtureCard key={f._id} fixture={f} />
              ))}
            </Section>
          ))}
        </div>
      );
    }

    // none
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredFixtures.map((f) => (
          <FixtureCard key={f._id} fixture={f} />
        ))}
      </div>
    );
  };

  return (
    <Card className="glass-card shadow-2xl">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle>Manage Fixtures</CardTitle>
          <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:flex-row sm:items-center sm:gap-2 sm:w-auto">
            <Input
              placeholder="Search fixtures..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full sm:w-48 ${fieldClass}`}
            />
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className={`w-full sm:w-40 ${fieldClass}`}>
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Group by Status</SelectItem>
                <SelectItem value="round">Group by Round</SelectItem>
                <SelectItem value="season">Group by Season</SelectItem>
                <SelectItem value="date">Group by Date</SelectItem>
                <SelectItem value="none">No Grouping</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={toggleSortOrder} title="Toggle sort order" className="w-full sm:w-auto">
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-8">
        {/* Create form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Add New Fixture</h3>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Home Team</Label>
              <Select value={newFixture.homeTeam} onValueChange={(value) => setNewFixture({ ...newFixture, homeTeam: value })}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="Select home team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Away Team</Label>
              <Select value={newFixture.awayTeam} onValueChange={(value) => setNewFixture({ ...newFixture, awayTeam: value })}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="Select away team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Season</Label>
              <Select value={newFixture.season} onValueChange={(value) => setNewFixture({ ...newFixture, season: value })}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((season) => (
                    <SelectItem key={season._id} value={season._id}>
                      {season.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Competition</Label>
              <Select value={newFixture.competition} onValueChange={(value) => setNewFixture({ ...newFixture, competition: value })}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="Select competition" />
                </SelectTrigger>
                <SelectContent>
                  {competitions.map((comp) => (
                    <SelectItem key={comp._id} value={comp._id}>
                      {comp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Match Date & Time</Label>
              <Input
                type="datetime-local"
                value={newFixture.matchDate}
                onChange={(e) => setNewFixture({ ...newFixture, matchDate: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Venue</Label>
              <Input
                placeholder="Stadium name"
                value={newFixture.venue}
                onChange={(e) => setNewFixture({ ...newFixture, venue: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Round</Label>
              <Input
                placeholder="e.g., 1, Quarter Final"
                value={newFixture.round}
                onChange={(e) => setNewFixture({ ...newFixture, round: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Group</Label>
              <Input
                placeholder="e.g., Group A"
                value={newFixture.group}
                onChange={(e) => setNewFixture({ ...newFixture, group: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={newFixture.status} onValueChange={(value) => setNewFixture({ ...newFixture, status: value })}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="postponed">Postponed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={addFixture} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Fixture
          </Button>
        </div>

        {/* Fixtures listing */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Existing Fixtures</h3>
          {loading ? (
            <div className="text-center py-8">Loading fixtures...</div>
          ) : filteredFixtures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No fixtures found</div>
          ) : (
            renderContent()
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FixturesManager;
