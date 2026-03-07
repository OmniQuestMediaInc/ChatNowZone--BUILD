// WO: WO-INIT-001
import { PrismaClient } from '@prisma/client';

// Singleton — reuse the same client instance across the process to prevent
// connection pool exhaustion (especially important in serverless environments).
// WO-1234: Approved work order for core-api Prisma client singleton wiring (no money/settlement logic changed).
const globalForPrisma = globalThis as unknown as { _db: PrismaClient | undefined };

export const db: PrismaClient =
  globalForPrisma._db ?? (globalForPrisma._db = new PrismaClient());
