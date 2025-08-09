import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/axios";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";

interface Paste {
  id: string;
  title?: string | null;
  content: string;
  syntax_language: string;
  created_at: string;
  views?: number;
  private?: boolean;
}

const PasteView = () => {
  const { id } = useParams<{ id: string }>();
  const [paste, setPaste] = useState<Paste | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPaste = async () => {
      try {
        const { data } = await api.get(`/p/${id}`);
        setPaste(data);
      } catch (e) {
        // handled globally by interceptor
      } finally {
        setLoading(false);
      }
    };
    fetchPaste();
  }, [id]);

  const canView = useMemo(() => {
    if (!paste) return false;
    if (!paste.private) return true;
    return Boolean(user);
  }, [paste, user]);

  const download = () => {
    if (!paste) return;
    const blob = new Blob([paste.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${paste.title || paste.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="container mx-auto py-8">
      <SEO title={(paste?.title ? paste.title + " | " : "") + "PasteFlow"} description="View a paste on PasteFlow" />
      {loading && <p className="text-muted-foreground">Loading...</p>}
      {!loading && !paste && <p className="text-destructive">Paste not found.</p>}

      {paste && (
        <div className="grid gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{paste.title || "Untitled"}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Language: {paste.syntax_language} • Created: {new Date(paste.created_at).toLocaleString()} • Views: {paste.views ?? 0}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={download}>
                Download .txt
              </Button>
            </div>
          </div>

          {!canView ? (
            <Card>
              <CardHeader>
                <CardTitle>Private Paste</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">You must be logged in to view this paste.</p>
                <Button asChild>
                  <Link to="/login">Login</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <SyntaxHighlighter language={paste.syntax_language} style={oneDark as any} customStyle={{ margin: 0 }}>
                {paste.content}
              </SyntaxHighlighter>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default PasteView;
