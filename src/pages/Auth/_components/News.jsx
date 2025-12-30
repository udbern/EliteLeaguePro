import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, ArrowUpDown, Pencil, Check, X, Image as ImageIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import client, { urlFor } from "@/lib/sanityClient";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Custom styles for ReactQuill
const quillStyles = `
  .ql-toolbar {
    border-top-left-radius: 0.375rem;
    border-top-right-radius: 0.375rem;
    border-bottom: none;
    background: hsl(var(--background));
    border: 1px solid hsl(var(--border));
    border-bottom: none;
  }
  .ql-container {
    border-bottom-left-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
    border-top: none;
    min-height: 120px;
    border: 1px solid hsl(var(--border));
    border-top: none;
    background: hsl(var(--background));
  }
  .ql-editor {
    min-height: 120px;
    color: hsl(var(--foreground));
    background: hsl(var(--background));
  }
  .ql-editor.ql-blank::before {
    color: hsl(var(--muted-foreground));
  }
  .ql-toolbar .ql-stroke {
    stroke: hsl(var(--foreground));
  }
  .ql-toolbar .ql-fill {
    fill: hsl(var(--foreground));
  }
  .ql-toolbar button:hover {
    background: hsl(var(--accent));
  }
  .ql-toolbar button.ql-active {
    background: hsl(var(--accent));
  }
`;

const NewsManager = ({ news, setNews }) => {
  const { toast } = useToast();

  // Helper function to convert HTML to Sanity blocks
  const htmlToBlocks = (html) => {
    if (!html) return [];
    
    // Simple HTML to blocks conversion
    // For more complex HTML, you might want to use a proper HTML parser
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const blocks = [];
    const paragraphs = tempDiv.querySelectorAll('p');
    
    if (paragraphs.length === 0) {
      // If no paragraphs, treat as single block
      blocks.push({
        _type: 'block',
        children: [{
          _type: 'span',
          text: tempDiv.textContent || html
        }]
      });
    } else {
      paragraphs.forEach(p => {
        blocks.push({
          _type: 'block',
          children: [{
            _type: 'span',
            text: p.textContent
          }]
        });
      });
    }
    
    return blocks;
  };

  // Helper function to convert Sanity blocks to HTML
  const blocksToHtml = (blocks) => {
    if (!blocks || !Array.isArray(blocks)) return '';
    
    return blocks.map(block => {
      if (block._type === 'block' && block.children) {
        return `<p>${block.children.map(child => child.text || '').join('')}</p>`;
      }
      return '';
    }).join('');
  };

  // Local news state for fetched data
  const [fetchedNews, setFetchedNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newItem, setNewItem] = useState({
    title: "",
    content: "",
    category: "",
    thumbnail: null,
    published_at: "",
  });
  const [mediaFile, setMediaFile] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editItem, setEditItem] = useState(null);

  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState("desc");

  // ReactQuill modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'link'
  ];

  // Fetch news from Sanity
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const newsData = await client.fetch(
          `*[_type == "news"] | order(published_at desc) {
            _id,
            title,
            slug,
            content,
            category,
            thumbnail,
            published_at,
            _createdAt,
            _updatedAt
          }`
        );
        setFetchedNews(newsData);
        setNews(newsData); // Update parent state
      } catch (error) {
        console.error("Error fetching news:", error);
        toast({ title: "Error loading news", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [setNews, toast]);

  const addNews = async () => {
    if (!newItem.title || !newItem.content || !newItem.category || !mediaFile) {
      return toast({ title: "Error", description: "Title, content, category, and thumbnail required", variant: "destructive" });
    }

    try {
      // Create the news document in Sanity
      const doc = {
        _type: 'news',
        title: newItem.title,
        content: htmlToBlocks(newItem.content),
        category: newItem.category,
        thumbnail: mediaFile, // This should be uploaded properly, but for now assuming it's handled
        published_at: newItem.published_at || new Date().toISOString(),
      };

      const createdDoc = await client.create(doc);
      
      // Update local state
      setFetchedNews(prev => [createdDoc, ...prev]);
      setNews(prev => [createdDoc, ...prev]);

      setNewItem({ title: "", content: "", category: "", thumbnail: null, published_at: "" });
      setMediaFile(null);

      toast({ title: "✅ News article added successfully" });
    } catch (error) {
      console.error("Error adding news:", error);
      toast({ title: "Error adding news", variant: "destructive" });
    }
  };

  const startEdit = (n) => { 
    setEditingId(n._id); 
    setEditItem({ 
      title: n.title || "",
      content: blocksToHtml(n.content),
      category: n.category || "",
      published_at: n.published_at ? new Date(n.published_at).toISOString().slice(0, 16) : "",
    }); 
  };
  const cancelEdit = () => { setEditingId(null); setEditItem(null); };

  const saveEdit = async () => {
    if (!editingId || !editItem.title || !editItem.content || !editItem.category) {
      return toast({ title: "Error", description: "Title, content, and category required", variant: "destructive" });
    }

    try {
      const updatedDoc = await client.patch(editingId).set({
        title: editItem.title,
        content: htmlToBlocks(editItem.content),
        category: editItem.category,
        published_at: editItem.published_at,
      }).commit();

      // Update local state
      setFetchedNews(prev => prev.map(n => n._id === editingId ? updatedDoc : n));
      setNews(prev => prev.map(n => n._id === editingId ? updatedDoc : n));

      cancelEdit();
      toast({ title: "✅ News article updated successfully" });
    } catch (error) {
      console.error("Error updating news:", error);
      toast({ title: "Error updating news", variant: "destructive" });
    }
  };

  const deleteNews = async (id) => {
    try {
      await client.delete(id);
      setFetchedNews(prev => prev.filter(n => n._id !== id));
      setNews(prev => prev.filter(n => n._id !== id));
      toast({ title: "✅ News article deleted successfully" });
    } catch (error) {
      console.error("Error deleting news:", error);
      toast({ title: "Error deleting news", variant: "destructive" });
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return news.filter((n) => (n.title || "").toLowerCase().includes(q));
  }, [news, search]);
  const sorted = useMemo(() => {
    const d = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a,b) => ((new Date(a.published_at).getTime()||0) - (new Date(b.published_at).getTime()||0)) * d);
  }, [filtered, sortDir]);

  return (
    <Card className="glass-card shadow-md">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle>Manage News</CardTitle>
          <div className="flex items-center gap-2">
            <Input placeholder="Search news..." value={search} onChange={(e)=>setSearch(e.target.value)} className="w-56" />
            <Button variant="outline" onClick={()=>setSortDir(sortDir==='asc'?'desc':'asc')}><ArrowUpDown className="w-4 h-4" /></Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Loading news…</p>
          </div>
        ) : (
          <>
            {/* Create */}
            <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
            <Input placeholder="Title" value={newItem.title} onChange={(e)=>setNewItem({ ...newItem, title: e.target.value })} />
            <Select value={newItem.category} onValueChange={(val) => setNewItem({ ...newItem, category: val })}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="match">Match</SelectItem>
                <SelectItem value="injury">Injury</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input type="datetime-local" value={newItem.published_at} onChange={(e)=>setNewItem({ ...newItem, published_at: e.target.value })} />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Content</label>
              <ReactQuill
                value={newItem.content}
                onChange={(value) => setNewItem({ ...newItem, content: value })}
                theme="snow"
                placeholder="Write your news content here..."
                modules={quillModules}
                formats={quillFormats}
              />
            </div>
            <Input type="file" accept="image/*" onChange={(e)=>setMediaFile(e.target.files?.[0]||null)} className="md:col-span-2" />
          </div>
          <div className="flex justify-end"><Button onClick={addNews}><Plus className="w-4 h-4"/> Add News</Button></div>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AnimatePresence>
            {sorted.map((n)=> (
              <motion.div key={n.id} layout initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="p-4 glass-card rounded-xl border border-border/40 hover:border-primary/40 transition-colors">
                {editingId === n._id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                      <Input placeholder="Title" value={editItem?.title||""} onChange={(e)=>setEditItem({...editItem, title: e.target.value})} />
                      <Select value={editItem?.category||""} onValueChange={(val)=>setEditItem({...editItem, category: val})}>
                        <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transfer">Transfer</SelectItem>
                          <SelectItem value="match">Match</SelectItem>
                          <SelectItem value="injury">Injury</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="datetime-local" value={editItem?.published_at||""} onChange={(e)=>setEditItem({...editItem, published_at: e.target.value})} />
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Content</label>
                        <ReactQuill
                          value={editItem?.content||""}
                          onChange={(value) => setEditItem({...editItem, content: value})}
                          theme="snow"
                          placeholder="Write your news content here..."
                          modules={quillModules}
                          formats={quillFormats}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={saveEdit}><Check className="w-4 h-4"/></Button>
                      <Button variant="ghost" onClick={cancelEdit}><X className="w-4 h-4"/></Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {n.thumbnail && (
                        <img 
                          src={urlFor(n.thumbnail).width(60).height(40).url()} 
                          alt="Thumbnail" 
                          className="rounded object-cover w-15 h-10" 
                        />
                      )}
                      <div>
                        <div className="font-medium">{n.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {n.category} • {n.published_at ? new Date(n.published_at).toLocaleDateString() : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={()=>startEdit(n)}><Pencil className="w-4 h-4"/></Button>
                      <Button variant="ghost" size="icon" onClick={()=>deleteNews(n._id)} className="text-destructive"><Trash2 className="w-4 h-4"/></Button>
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

export default NewsManager;
