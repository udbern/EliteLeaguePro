import { useEffect, useMemo, useState } from "react"; 
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, ArrowUpDown, Pencil, Check, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import client, { urlFor } from "@/lib/sanityClient";

const VideosManager = ({ videos, setVideos }) => {
  const { toast } = useToast();

  // Local videos state for fetched data
  const [fetchedVideos, setFetchedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newVideo, setNewVideo] = useState({
    fixture: "",
    video: null,
    thumbnail: null,
    published_at: "",
  });

  const [videoFile, setVideoFile] = useState(null);
  const [videoSort, setVideoSort] = useState("desc");
  const [sortBy, setSortBy] = useState("date");
  const [search, setSearch] = useState("");
  const [teams, setTeams] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editVid, setEditVid] = useState(null);

  // Fetch videos from Sanity
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const videosData = await client.fetch(
          `*[_type == "videoHighlight"] | order(published_at desc) {
            _id,
            title,
            fixture->{
              homeTeam->{name, logo},
              awayTeam->{name, logo},
              match_date
            },
            slug,
            video,
            thumbnail,
            published_at,
            _createdAt,
            _updatedAt
          }`
        );
        setFetchedVideos(videosData);
        setVideos(videosData); // Update parent state
      } catch (error) {
        console.error("Error fetching videos:", error);
        toast({ title: "Error loading videos", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [setVideos, toast]);

  // Fetch fixtures for dropdown
  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const fixturesData = await client.fetch(
          `*[_type == "fixture"] | order(match_date desc) {
            _id,
            homeTeam->{name},
            awayTeam->{name},
            match_date
          }`
        );
        setFixtures(fixturesData);
      } catch (error) {
        console.error("Error fetching fixtures:", error);
      }
    };

    fetchFixtures();
  }, []);

  const addItem = async () => {
    if (!newVideo.fixture || !videoFile) {
      return toast({ title: "Error", description: "Fixture + video file required", variant: "destructive" });
    }

    try {
      // Create the video highlight document in Sanity
      const doc = {
        _type: 'videoHighlight',
        fixture: { _type: 'reference', _ref: newVideo.fixture },
        video: videoFile, // This should be uploaded properly, but for now assuming it's handled
        thumbnail: newVideo.thumbnail,
        published_at: newVideo.published_at || new Date().toISOString(),
      };

      const createdDoc = await client.create(doc);
      
      // Update local state
      setFetchedVideos(prev => [createdDoc, ...prev]);
      setVideos(prev => [createdDoc, ...prev]);

      setNewVideo({ fixture: "", video: null, thumbnail: null, published_at: "" });
      setVideoFile(null);

      toast({ title: "✅ Video highlight added successfully" });
    } catch (error) {
      console.error("Error adding video:", error);
      toast({ title: "Error adding video", variant: "destructive" });
    }
  };

  const deleteItem = async (id) => {
    try {
      await client.delete(id);
      setFetchedVideos(prev => prev.filter(v => v._id !== id));
      setVideos(prev => prev.filter(v => v._id !== id));
      toast({ title: "✅ Video highlight deleted successfully" });
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({ title: "Error deleting video", variant: "destructive" });
    }
  };

  const startEdit = (v) => {
    setEditingId(v._id);
    setEditVid({
      fixture: v.fixture?._id || "",
      published_at: v.published_at ? new Date(v.published_at).toISOString().slice(0, 16) : "",
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditVid(null); };

  const saveEdit = async () => {
    if (!editingId || !editVid.fixture) {
      return toast({ title: "Error", description: "Fixture required", variant: "destructive" });
    }

    try {
      const updatedDoc = await client.patch(editingId).set({
        fixture: { _type: 'reference', _ref: editVid.fixture },
        published_at: editVid.published_at,
      }).commit();

      // Update local state
      setFetchedVideos(prev => prev.map(v => v._id === editingId ? updatedDoc : v));
      setVideos(prev => prev.map(v => v._id === editingId ? updatedDoc : v));

      cancelEdit();
      toast({ title: "✅ Video highlight updated successfully" });
    } catch (error) {
      console.error("Error updating video:", error);
      toast({ title: "Error updating video", variant: "destructive" });
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return videos.filter((v) => (v.title || "").toLowerCase().includes(term));
  }, [videos, search]);

  const sortedVideos = useMemo(() => {
    const dir = videoSort === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortBy === "title") return (a.title || "").localeCompare(b.title || "") * dir;
      const ad = a.published_at ? new Date(a.published_at).getTime() : 0;
      const bd = b.published_at ? new Date(b.published_at).getTime() : 0;
      return (ad - bd) * dir;
    });
  }, [filtered, sortBy, videoSort]);

  return (
    <Card className="glass-card shadow-md">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle>Manage Videos</CardTitle>
          <div className="flex items-center gap-2">
            <Input placeholder="Search videos..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Published date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setVideoSort(videoSort === "asc" ? "desc" : "asc")}>
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Loading videos…</p>
          </div>
        ) : (
          <>
        {/* Upload Form */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2 items-end">
            <Select value={newVideo.fixture} onValueChange={(val) => setNewVideo({ ...newVideo, fixture: val })}>
              <SelectTrigger><SelectValue placeholder="Select fixture" /></SelectTrigger>
              <SelectContent>
                {fixtures.map((f) => (
                  <SelectItem key={f._id} value={f._id}>
                    {f.homeTeam?.name} vs {f.awayTeam?.name} — {new Date(f.match_date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input type="datetime-local" value={newVideo.published_at} onChange={(e) => setNewVideo({ ...newVideo, published_at: e.target.value })} />

            <Input 
              type="file" 
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="sm:col-span-2"
            />

            <Input 
              type="file" 
              accept="image/*"
              onChange={(e) => setNewVideo({ ...newVideo, thumbnail: e.target.files[0] })}
              placeholder="Thumbnail (optional)"
              className="sm:col-span-2"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={addItem}><Plus className="w-4 h-4" /> Add Video Highlight</Button>
          </div>
        </div>

        {/* Video List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AnimatePresence>
            {sortedVideos.map((video) => (
              <motion.div 
                key={video.id} 
                layout 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                className="p-4 glass-card rounded-xl border border-border/40 hover:border-primary/40 transition-colors"
              >
                {editingId === video._id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                      <Select value={editVid?.fixture || ""} onValueChange={(val) => setEditVid({ ...editVid, fixture: val })}>
                        <SelectTrigger><SelectValue placeholder="Fixture" /></SelectTrigger>
                        <SelectContent>
                          {fixtures.map((f) => (
                            <SelectItem key={f._id} value={f._id}>
                              {f.homeTeam?.name} vs {f.awayTeam?.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input type="datetime-local" value={editVid?.published_at || ""} onChange={(e) => setEditVid({ ...editVid, published_at: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={saveEdit}><Check className="w-4 h-4" /></Button>
                      <Button variant="ghost" onClick={cancelEdit}><X className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {video.thumbnail && (
                        <img 
                          src={urlFor(video.thumbnail).width(60).height(40).url()} 
                          alt="Thumbnail" 
                          className="rounded object-cover w-15 h-10" 
                        />
                      )}
                      <div>
                        <div className="font-medium">{video.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {video.fixture?.homeTeam?.name} vs {video.fixture?.awayTeam?.name} • {video.published_at ? new Date(video.published_at).toLocaleDateString() : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => startEdit(video)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteItem(video._id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default VideosManager;
