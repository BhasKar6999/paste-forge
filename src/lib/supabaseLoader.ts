// Lazy loader for the Supabase client to avoid build errors when integration isn't connected
let _supabase: any | null = null;

export async function getSupabase() {
  if (_supabase) return _supabase;
  try {
    const path = "@/integrations/supabase/client";
    // @ts-ignore
    const mod = await import(/* @vite-ignore */ (path as any));
    _supabase = (mod as any).supabase;
    return _supabase;
  } catch (e) {
    console.warn("Supabase client not available. Connect Supabase integration to enable auth.");
    throw new Error("Supabase client not available");
  }
}
