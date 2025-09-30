
import { createClient } from '@supabase/supabase-js';

// Get URL from the public env (safer to use NEXT_PUBLIC_ for client/server shared)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Get key from the server-only env (safer for server components/APIs)
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables!");
}

export const supabase = createClient(supabaseUrl, supabaseKey);