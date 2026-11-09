import type { User } from '@supabase/supabase-js';
import { getSupabaseAdmin } from './supabase-admin';

export type ApiAuth = {
  configured: boolean;
  user: User | null;
};

export function isServerSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// Čita Bearer token iz zahteva i proverava ga preko Supabase Auth.
export async function getApiAuth(req: Request): Promise<ApiAuth> {
  if (!isServerSupabaseConfigured()) {
    return { configured: false, user: null };
  }

  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) {
    return { configured: true, user: null };
  }

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) {
      return { configured: true, user: null };
    }
    return { configured: true, user: data.user };
  } catch {
    return { configured: true, user: null };
  }
}
