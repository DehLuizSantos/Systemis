import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7's `prisma-client` generator requires an explicit driver adapter
// instead of resolving the connection from `DATABASE_URL` implicitly.
// Path is relative to the project root (same as the Prisma CLI resolves it).
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

// Avoid exhausting the SQLite connection pool with a fresh PrismaClient on
// every hot-reload in development by caching a single instance on `globalThis`.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
