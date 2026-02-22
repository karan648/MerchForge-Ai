import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

import { env } from "@/server/config/env";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
  adapter?: PrismaPg;
};

function getAdapter() {
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  if (!globalForPrisma.adapter) {
    globalForPrisma.adapter = new PrismaPg(globalForPrisma.pool);
  }

  return globalForPrisma.adapter;
}

export function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      adapter: getAdapter(),
      log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
    });
  }

  return globalForPrisma.prisma;
}
