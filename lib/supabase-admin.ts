import { createClient } from '@supabase/supabase-js';

// Serverski Supabase klijent (service role) za pisanje/čitanje iz baze.
// Kreira se tek pri pozivu, da bi build radio i bez serverskih tajni.
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Nedostaju Supabase serverske promenljive okruženja.');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}
