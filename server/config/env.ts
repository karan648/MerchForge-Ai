function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function isPlaceholder(value: string): boolean {
  return value.includes("YOUR_") || value.includes("YOUR-PASSWORD");
}

function requiredOneOf(names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value && !isPlaceholder(value)) {
      return value;
    }
  }

  throw new Error(`Missing required environment variable. Set one of: ${names.join(", ")}`);
}

function optionalOneOf(names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value && !isPlaceholder(value)) {
      return value;
    }
  }

  return undefined;
}

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  NEXT_PUBLIC_SUPABASE_URL: required("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requiredOneOf([
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ]),
  SUPABASE_SERVICE_ROLE_KEY: optionalOneOf(["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"]),
  APP_BASE_URL: process.env.APP_BASE_URL ?? "http://localhost:3000",
} as const;
