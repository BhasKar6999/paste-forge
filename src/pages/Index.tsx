import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeEditor, languageOptions, type SyntaxLanguage } from "@/components/editor/CodeEditor";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { SEO } from "@/components/SEO";

const expirations = [
  { label: "Never", value: "never" },
  { label: "10 minutes", value: "10m" },
  { label: "1 hour", value: "1h" },
  { label: "1 day", value: "1d" },
  { label: "7 days", value: "7d" },
];

const Index = () => {
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<SyntaxLanguage>("plaintext");
  const [expiration, setExpiration] = useState<string>("never");
  const [isPrivate, setIsPrivate] = useState(false);
  const [encrypt, setEncrypt] = useState(false);
  const [content, setContent] = useState("");
  const [result, setResult] = useState<{ id: string; link: string; edit_token?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!content.trim()) {
      toast.error("Paste content is required");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post("/pastes", {
        title: title || null,
        content,
        syntax_language: language,
        expiration,
        private: isPrivate,
        encrypt,
      });
      const id = data?.id || data?.paste_id;
      const edit_token = data?.edit_token;
      if (!id) throw new Error("Unexpected response from server");
      const link = `${window.location.origin}/p/${id}`;
      setResult({ id, link, edit_token });
      toast.success("Paste created");
    } catch (e: any) {
      toast.error(e?.message || "Failed to create paste");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <main className="container mx-auto py-8">
      <SEO title="Create Paste | PasteFlow" description="Create and share code snippets with syntax highlighting, privacy, and encryption." />
      <h1 className="text-3xl font-bold mb-6">Create a New Paste</h1>

      <section className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="title">Title (optional)</Label>
          <Input id="title" placeholder="My useful snippet" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={(v) => setLanguage(v as SyntaxLanguage)}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
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

          <div className="grid gap-2">
            <Label>Expiration</Label>
            <Select value={expiration} onValueChange={(v) => setExpiration(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select expiration" />
              </SelectTrigger>
              <SelectContent>
                {expirations.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-6 pt-6 md:pt-0">
            <div className="flex items-center space-x-2">
              <Checkbox id="private" checked={isPrivate} onCheckedChange={(v) => setIsPrivate(Boolean(v))} />
              <Label htmlFor="private">Private paste</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="encrypt" checked={encrypt} onCheckedChange={(v) => setEncrypt(Boolean(v))} />
              <Label htmlFor="encrypt">Encrypt</Label>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Content</Label>
          <CodeEditor value={content} onChange={setContent} language={language} />
        </div>

        <div>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Paste"}
          </Button>
        </div>

        {result && (
          <article className="rounded-lg border p-4 bg-card">
            <h2 className="text-lg font-semibold mb-2">Your paste is ready</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Link:</span>
              <a href={result.link} className="underline break-all" rel="noopener noreferrer">
                {result.link}
              </a>
              <Button variant="secondary" onClick={() => copy(result.link)}>
                Copy link
              </Button>
            </div>
            {result.edit_token && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-sm text-muted-foreground">Edit token (save this!):</span>
                <code className="px-2 py-1 rounded bg-muted text-muted-foreground break-all">{result.edit_token}</code>
                <Button variant="secondary" onClick={() => copy(result.edit_token!)}>
                  Copy token
                </Button>
              </div>
            )}
          </article>
        )}
      </section>
    </main>
  );
};

export default Index;
