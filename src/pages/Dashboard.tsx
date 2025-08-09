import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { languageOptions, SyntaxLanguage } from "@/components/editor/CodeEditor";
import { SEO } from "@/components/SEO";

interface PasteItem {
  id: string;
  title?: string | null;
  syntax_language: SyntaxLanguage | string;
  views?: number;
  expires_at?: string | null;
  private?: boolean;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<PasteItem[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchMine = async () => {
      try {
        const { data } = await api.get("/pastes/mine");
        setItems(data?.items || data || []);
      } catch {}
    };
    fetchMine();
  }, [user]);

  if (!loading && !user) return <Navigate to="/login" replace />;

  const onDelete = async (id: string) => {
    setBusyId(id);
    try {
      await api.delete(`/pastes/${id}`);
      setItems((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setBusyId(null);
    }
  };

  const onSave = async (p: PasteItem) => {
    setBusyId(p.id);
    try {
      const payload = {
        title: p.title || null,
        syntax_language: p.syntax_language,
        private: p.private,
      };
      await api.patch(`/pastes/${p.id}`, payload);
    } finally {
      setBusyId(null);
    }
  };

  const onClaim = async (p: PasteItem) => {
    const token = window.prompt("Enter edit token to claim this paste");
    if (!token) return;
    setBusyId(p.id);
    try {
      await api.post(`/pastes/${p.id}/claim`, { edit_token: token });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="container mx-auto py-8">
      <SEO title="Dashboard | PasteFlow" description="Manage your pastes on PasteFlow." />
      <h1 className="text-2xl font-bold mb-6">Your Pastes</h1>
      <div className="grid gap-4">
        {items.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="truncate mr-4">{p.title || "Untitled"}</span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Views: {p.views ?? 0}</span>
                  {p.expires_at ? <span>• Expires: {new Date(p.expires_at).toLocaleString()}</span> : <span>• Never expires</span>}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-3 items-end">
                <div className="grid gap-1">
                  <Label>Title</Label>
                  <Input value={p.title || ""} onChange={(e) => setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, title: e.target.value } : x)))} />
                </div>
                <div className="grid gap-1">
                  <Label>Language</Label>
                  <Select value={String(p.syntax_language)} onValueChange={(v) => setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, syntax_language: v } : x)))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`priv-${p.id}`}
                    checked={Boolean(p.private)}
                    onCheckedChange={(v) => setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, private: Boolean(v) } : x)))}
                  />
                  <Label htmlFor={`priv-${p.id}`}>Private</Label>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="secondary" onClick={() => onClaim(p)} disabled={busyId === p.id}>
                    Claim
                  </Button>
                  <Button onClick={() => onSave(p)} disabled={busyId === p.id}>
                    Save
                  </Button>
                  <Button variant="destructive" onClick={() => onDelete(p.id)} disabled={busyId === p.id}>
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <p className="text-muted-foreground">No pastes yet. Create one from the home page.</p>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
