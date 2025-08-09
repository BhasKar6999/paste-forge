import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { SEO } from "@/components/SEO";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password);
      navigate("/login");
    } catch (e: any) {
      // handled by context toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto py-8 max-w-md">
      <SEO title="Register | PasteFlow" description="Register for a PasteFlow account to create private pastes and analytics." />
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="underline">Login</Link>
        </p>
      </form>
    </main>
  );
};

export default Register;
