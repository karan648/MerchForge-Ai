import { createClient } from "@supabase/supabase-js";

import { env } from "@/server/config/env";

function isPlaceholder(value: string): boolean {
  return value.includes("YOUR_") || value.includes("YOUR-PASSWORD");
}

function assertSupabaseRuntimeConfig() {
  if (isPlaceholder(env.NEXT_PUBLIC_SUPABASE_URL) || isPlaceholder(env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    throw new Error(
      "Supabase auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.",
    );
  }
}

export function createSupabaseAnonClient() {
  assertSupabaseRuntimeConfig();

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export function createSupabaseServiceClient() {
  assertSupabaseRuntimeConfig();

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) is required for admin operations.",
    );
  }

  if (isPlaceholder(env.SUPABASE_SERVICE_ROLE_KEY)) {
    throw new Error("Supabase service role key is not configured in .env.");
  }

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
