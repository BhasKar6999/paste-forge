import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { languageOptions } from "@/components/editor/CodeEditor";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";

interface SearchResult {
  id: string;
  title?: string | null;
  syntax_language: string;
  created_at: string;
  views?: number;
  private?: boolean;
}

const Search = () => {
  const [q, setQ] = useState("");
  const [language, setLanguage] = useState<string | undefined>(undefined);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params: any = { q, page };
      if (language) params.syntax_language = language;
      if (from) params.from = from;
      if (to) params.to = to;
      const { data } = await api.get("/pastes/search", { params });
      setResults(data?.items || data?.results || []);
      setTotal(data?.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <main className="container mx-auto py-8">
      <SEO title="Search | PasteFlow" description="Search public pastes by title, language, and date." />
      <h1 className="text-2xl font-bold mb-4">Search Pastes</h1>

      <section className="grid md:grid-cols-4 gap-4 items-end mb-6">
        <div className="grid gap-1 md:col-span-2">
          <Label htmlFor="q">Title</Label>
          <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title" />
        </div>
        <div className="grid gap-1">
          <Label>Language</Label>
          <Select value={language ?? ""} onValueChange={(v) => setLanguage(v || undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              {languageOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1 md:col-span-4 md:grid-cols-4 md:gap-4">
          <div className="grid gap-1">
            <Label>From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label>To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={() => { setPage(1); fetchResults(); }} disabled={loading}>Search</Button>
            <Button variant="secondary" onClick={() => { setQ(""); setLanguage(undefined); setFrom(""); setTo(""); setPage(1); fetchResults(); }}>Reset</Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        {loading && <p className="text-muted-foreground">Loading...</p>}
        {!loading && results.length === 0 && <p className="text-muted-foreground">No results.</p>}
        {results.map((r) => (
          <Link to={`/p/${r.id}`} key={r.id} className="rounded-md border p-3 hover:bg-accent transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{r.title || "Untitled"}</h3>
                <p className="text-sm text-muted-foreground">{r.syntax_language} • {new Date(r.created_at).toLocaleString()}</p>
              </div>
              <div className="text-sm text-muted-foreground">Views: {r.views ?? 0}</div>
            </div>
          </Link>
        ))}
      </section>

      <div className="flex items-center justify-between mt-6">
        <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
        <span className="text-sm text-muted-foreground">Page {page}{total ? ` • ${total} results` : ""}</span>
        <Button variant="secondary" onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </main>
  );
};

export default Search;
