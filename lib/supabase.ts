import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Make sure EXPO_PUBLIC_SUPABASE_URL " +
      "and EXPO_PUBLIC_SUPABASE_KEY are set in your .env file (see .env.example)."
  );
}

// This is the Supabase anon/public key, which is designed to be embedded in
// client apps and is safe to ship — access control is enforced server-side
// via Row Level Security (RLS) policies on each table, not by hiding this key.
// Never put the service_role key here.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
