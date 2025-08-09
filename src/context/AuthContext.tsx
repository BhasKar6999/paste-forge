import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { getSupabase } from "@/lib/supabaseLoader";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    const init = async () => {
      try {
        const supabase = await getSupabase();
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user ?? null);
        const { data: listener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
          setUser(session?.user ?? null);
        });
        unsub = () => listener.subscription.unsubscribe();
      } catch {
        // Supabase not connected; continue with anonymous session
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => {
      unsub?.();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn: async (email: string, password: string) => {
        const supabase = await getSupabase();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Logged in successfully");
      },
      signUp: async (email: string, password: string) => {
        const supabase = await getSupabase();
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Registered! Check your email.");
      },
      signOut: async () => {
        const supabase = await getSupabase();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        toast.success("Logged out");
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
