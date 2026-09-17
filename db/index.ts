import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set (see .env.example)");
}

// Reuse the pool across Next.js hot reloads in dev to avoid "Too many connections".
const globalForDb = globalThis as unknown as { pool?: mysql.Pool };

// drizzle-orm 1.0.0-rc.4 reads `client.config`, which the mysql2/promise pool no
// longer exposes (mysql2 >= 3.2x). The callback pool does, and drizzle wraps it itself.
const pool = globalForDb.pool ?? mysql.createPool(process.env.DATABASE_URL);

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle({ client: pool });

export * from "./schema";
