import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ArrowUpDown, Pencil, Check, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { getTeamLogo } from "@/utils/teamLogos";
import client, { urlFor } from "@/lib/sanityClient";

// Props: teams (array) and setTeams (setter) are provided from Admin.
const TeamsManager = ({ teams, setTeams }) => {
  const { toast } = useToast();

  // Unified modern field styling for inputs/selects
  const fieldClass = "h-11 rounded-lg bg-card/50 border-input/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/50 transition-colors";

  // Local teams state for fetched data
  const [fetchedTeams, setFetchedTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [newTeam, setNewTeam] = useState({ name: "", shortName: "", managerName: "", logo: "" });
  const [newLogoFile, setNewLogoFile] = useState(null);
  const [newManagerPhotoFile, setNewManagerPhotoFile] = useState(null);

  // Edit form
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editTeam, setEditTeam] = useState({ name: "", shortName: "", managerName: "", logo: "" });
  const [editLogoFile, setEditLogoFile] = useState(null);
  const [editManagerPhotoFile, setEditManagerPhotoFile] = useState(null);

  // UI state
  const [sortBy, setSortBy] = useState("name"); // name | createdAt | season
  const [sortOrder, setSortOrder] = useState("asc");
  const [groupBy, setGroupBy] = useState("season"); // season | month | none
  const [search, setSearch] = useState("");

  // Fetch teams from Sanity
  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const teamsData = await client.fetch(
          `*[_type == "team"] | order(_createdAt desc) {
            _id,
            name,
            shortName,
            managerName,
            managerPhoto,
            logo,
            seasons[]->{
              _id,
              name,
              isActive,
              startDate,
              endDate
            },
            _createdAt
          }`
        );
        setFetchedTeams(teamsData);
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast({ title: "Error", description: "Failed to fetch teams", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [toast]);

  // Actions
  const addTeam = async () => {
    if (!newTeam.name) return toast({ title: "Error", description: "Team name is required", variant: "destructive" });

    try {
      const payload = {
        _type: "team",
        name: newTeam.name,
        shortName: newTeam.shortName || null,
        managerName: newTeam.managerName || null,
        logo: newLogoFile ? { _type: "image", asset: { _type: "reference", _ref: "TODO" } } : null,
        managerPhoto: newManagerPhotoFile ? { _type: "image", asset: { _type: "reference", _ref: "TODO" } } : null,
      };

      const result = await client.create(payload);
      setFetchedTeams((prev) => [result, ...prev]);
      setNewTeam({ name: "", shortName: "", managerName: "", logo: "" });
      setNewLogoFile(null);
      setNewManagerPhotoFile(null);
      toast({ title: "Team added successfully" });
    } catch (error) {
      console.error("Error adding team:", error);
      toast({ title: "Error", description: "Failed to add team", variant: "destructive" });
    }
  };

  const startEdit = (team) => {
    setEditingTeamId(team._id);
    setEditTeam({ name: team.name || "", shortName: team.shortName || "", managerName: team.managerName || "", logo: team.logo || "" });
    setEditLogoFile(null);
  };

  const cancelEdit = () => {
    setEditingTeamId(null);
    setEditTeam({ name: "", shortName: "", managerName: "", logo: "" });
  };

  const saveEdit = async () => {
    if (!editingTeamId) return;

    try {
      const payload = {
        name: editTeam.name,
        shortName: editTeam.shortName || null,
        managerName: editTeam.managerName || null,
        logo: editLogoFile ? { _type: "image", asset: { _type: "reference", _ref: "TODO" } } : editTeam.logo,
        managerPhoto: editManagerPhotoFile ? { _type: "image", asset: { _type: "reference", _ref: "TODO" } } : editTeam.managerPhoto,
      };

      const result = await client.patch(editingTeamId).set(payload).commit();
      setFetchedTeams((prev) => prev.map((t) => (t._id === editingTeamId ? result : t)));
      cancelEdit();
      toast({ title: "Team updated successfully" });
    } catch (error) {
      console.error("Error updating team:", error);
      toast({ title: "Error", description: "Failed to update team", variant: "destructive" });
    }
  };

  const deleteTeam = async (id) => {
    try {
      await client.delete(id);
      setFetchedTeams((prev) => prev.filter((team) => team._id !== id));
      toast({ title: "Team deleted successfully" });
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({ title: "Error", description: "Failed to delete team", variant: "destructive" });
    }
  };

  const toggleSortOrder = () => setSortOrder((s) => (s === "asc" ? "desc" : "asc"));

  // Derived data
  const filteredTeams = useMemo(() => {
    const list = Array.isArray(fetchedTeams) ? fetchedTeams : [];
    const byName = search.trim().toLowerCase();
    const filtered = byName ? list.filter((t) => t.name.toLowerCase().includes(byName)) : list;

    // Sort by selected criteria
    const sorted = [...filtered].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name || "";
          bValue = b.name || "";
          break;
        case "createdAt":
          aValue = new Date(a._createdAt || 0);
          bValue = new Date(b._createdAt || 0);
          break;
        case "season":
          // Sort by number of seasons (teams with more seasons first)
          aValue = a.seasons?.length || 0;
          bValue = b.seasons?.length || 0;
          break;
        default:
          aValue = a.name || "";
          bValue = b.name || "";
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [fetchedTeams, search, sortBy, sortOrder]);

  const teamsBySeason = useMemo(() => {
    // Build map seasonId -> array of teams
    const map = new Map();
    filteredTeams.forEach((t) => {
      if (!t.seasons || t.seasons.length === 0) {
        // Put in "Unassigned" bucket
        const key = "__unassigned__";
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(t);
      } else {
        t.seasons.forEach((season) => {
          const sid = season._id;
          if (!map.has(sid)) map.set(sid, []);
          map.get(sid).push(t);
        });
      }
    });
    return map;
  }, [filteredTeams]);

  const teamsByMonth = useMemo(() => {
    // Group by created_at month (YYYY-MM)
    const map = new Map();
    filteredTeams.forEach((t) => {
      const d = t._createdAt ? new Date(t._createdAt) : null;
      const key = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : "Unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(t);
    });
    // Sort keys descending (newest first)
    return new Map([...map.entries()].sort((a, b) => b[0].localeCompare(a[0])));
  }, [filteredTeams]);

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

  const TeamCard = ({ team }) => (
    <div className="p-4 glass-card rounded-md border border-border/40 hover:border-primary/40 transition-colors">
      {editingTeamId === team._id ? (
        <div className="grid gap-3 sm:grid-cols-[1fr_120px_1fr_1fr_1fr_auto_auto] items-end">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input value={editTeam.name} onChange={(e) => setEditTeam({ ...editTeam, name: e.target.value })} className={fieldClass} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Short</Label>
            <Input value={editTeam.shortName} onChange={(e) => setEditTeam({ ...editTeam, shortName: e.target.value.toUpperCase() })} className={fieldClass} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Manager</Label>
            <Input value={editTeam.managerName} onChange={(e) => setEditTeam({ ...editTeam, managerName: e.target.value })} className={fieldClass} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Logo URL</Label>
            <Input value={editTeam.logo} onChange={(e) => setEditTeam({ ...editTeam, logo: e.target.value })} className={fieldClass} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Logo File</Label>
            <Input type="file" accept="image/*" onChange={(e) => setEditLogoFile(e.target.files?.[0] || null)} className={fieldClass} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Manager Photo File</Label>
            <Input type="file" accept="image/*" onChange={(e) => setEditManagerPhotoFile(e.target.files?.[0] || null)} className={fieldClass} />
          </div>
          <Button variant="outline" onClick={saveEdit} title="Save">
            <Check className="w-4 h-4" />
          </Button>
          <Button variant="ghost" onClick={cancelEdit} title="Cancel">
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={team.logo ? urlFor(team.logo).url() : getTeamLogo(team.name)} alt={team.name} className="w-8 h-8 rounded-full" />
            <div>
              <div className="font-medium">{team.name}</div>
              {team.shortName && <div className="text-xs text-muted-foreground">{team.shortName}</div>}
              {team.managerName && <div className="text-xs text-muted-foreground">Manager: {team.managerName}</div>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => startEdit(team)} title="Edit">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => deleteTeam(team._id)} className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Delete">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Sections by grouping
  const renderContent = () => {
    if (groupBy === "season") {
      const entries = Array.from(teamsBySeason.entries());
      // Sort: by season number asc; "Unassigned" last
      entries.sort((a, b) => {
        const [sa, ta] = a;
        const [sb, tb] = b;
        if (sa === "__unassigned__") return 1;
        if (sb === "__unassigned__") return -1;
        // Extract season number
        const seasonA = ta[0]?.seasons?.find(s => s._id === sa);
        const seasonB = tb[0]?.seasons?.find(s => s._id === sb);
        const getSeasonNumber = (season) => {
          const name = season?.name || "";
          const match = name.match(/Season (\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        };
        const numA = getSeasonNumber(seasonA);
        const numB = getSeasonNumber(seasonB);
        return numA - numB;
      });

      return (
        <div className="space-y-8 p-3">
          {entries.map(([sid, list]) => {
            const season = list[0]?.seasons?.find(s => s._id === sid);
            const title = sid === "__unassigned__" ? "Unassigned" : `${season?.name ?? "Season"}`;
            return (
              <Section key={sid} title={title}>
                {list.map((t) => (
                  <TeamCard key={t._id} team={t} />
                ))}
              </Section>
            );
          })}
        </div>
      );
    }

    if (groupBy === "month") {
      const entries = Array.from(teamsByMonth.entries());
      return (
        <div className="space-y-8">
          {entries.map(([month, list]) => (
            <Section key={month} title={month}>
              {list.map((t) => (
                <TeamCard key={t._id} team={t} />
              ))}
            </Section>
          ))}
        </div>
      );
    }

    // none
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTeams.map((t) => (
          <TeamCard key={t._id} team={t} />
        ))}
      </div>
    );
  };

  return (
    <Card className="glass-card shadow-2xl ">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle>Manage Teams</CardTitle>
          <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:flex-row sm:items-center sm:gap-2 sm:w-auto">
            <Input
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full sm:w-48 ${fieldClass}`}
            />
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className={`w-full sm:w-40 ${fieldClass}`}>
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="season">Group by Season</SelectItem>
                <SelectItem value="month">Group by Created Month</SelectItem>
                <SelectItem value="none">No Grouping</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={toggleSortOrder} title="Toggle sort by name" className="w-full sm:w-auto">
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-8">
        {/* Create form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Add New Team</h3>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Team Name</Label>
              <Input
                placeholder="Enter team name"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Short Name</Label>
              <Input
                placeholder="e.g., MCI, ARS"
                value={newTeam.shortName}
                onChange={(e) => setNewTeam({ ...newTeam, shortName: e.target.value.toUpperCase() })}
                className={fieldClass}
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Manager Name</Label>
              <Input
                placeholder="Team manager's name"
                value={newTeam.managerName}
                onChange={(e) => setNewTeam({ ...newTeam, managerName: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Logo URL (Optional)</Label>
              <Input
                placeholder="https://example.com/logo.png"
                value={newTeam.logo}
                onChange={(e) => setNewTeam({ ...newTeam, logo: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload Logo (Optional)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setNewLogoFile(e.target.files?.[0] || null)} className={fieldClass} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload Manager Photo (Optional)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setNewManagerPhotoFile(e.target.files?.[0] || null)} className={fieldClass} />
            </div>
          </div>
          <div className="flex  justify-end pt-2">
            <Button onClick={addTeam} className="w-full  sm:w-auto ">
              <Plus className="w-4 h-4 mr-2" /> Add Team
            </Button>
          </div>
        </div>

        {/* Listing */}
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default TeamsManager;
