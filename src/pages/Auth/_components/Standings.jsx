import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, ArrowUpDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const StandingsManager = ({ standings, setStandings }) => {
  const { toast } = useToast();
  const [standingSort, setStandingSort] = useState("asc");
  const [newStanding, setNewStanding] = useState({ team: "", points: 0 });

  const addItem = async () => {
    setStandings((prev) => [
      ...prev,
      { ...newStanding, id: crypto.randomUUID?.() ?? Date.now().toString() },
    ]);
    setNewStanding({ team: "", points: 0 });
    toast({ title: "Standing added locally" });
  };

  const deleteItem = async (id) => {
    setStandings(standings.filter((s) => s.id !== id));
    toast({ title: "Standing deleted locally" });
  };

  const sortedStandings = [...standings].sort((a, b) =>
    standingSort === "asc" ? a.points - b.points : b.points - a.points
  );

  const toggleSort = () => setStandingSort(standingSort === "asc" ? "desc" : "asc");

  return (
    <Card className="glass-card shadow-2xl">
      <CardHeader className="border-b border-border/50 flex items-center justify-between">
        <CardTitle>Manage Standings</CardTitle>
        <Button onClick={toggleSort}>
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3">
          <Input placeholder="Team" value={newStanding.team} onChange={(e) => setNewStanding({ ...newStanding, team: e.target.value })} />
          <Input placeholder="Points" type="number" value={newStanding.points} onChange={(e) => setNewStanding({ ...newStanding, points: Number(e.target.value) })} />
          <Button onClick={addItem}>
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>

        <div className="grid gap-3">
          <AnimatePresence>
            {sortedStandings.map((st) => (
              <motion.div
                key={st.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-between p-4 glass-card rounded-xl hover:border-primary/40 smooth-transition"
              >
                <span>{st.team} • {st.points} pts</span>
                <Button variant="ghost" size="icon" onClick={() => deleteItem(st.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default StandingsManager;
