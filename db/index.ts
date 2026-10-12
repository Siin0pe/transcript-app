import { readFile } from "node:fs/promises"
import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

const client = createClient({ url: "file:transcript.db" })

export const db = drizzle({ client })

let initPromise: Promise<void> | null = null

async function createTables() {
  await client.execute("PRAGMA foreign_keys = ON")

  const result = await client.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'notes'"
  )
  if (result.rows.length === 0) {
    const script = await readFile("db/init.sql", "utf8")
    await client.executeMultiple(script)
  }
}

export function initDb() {
  if (!initPromise) {
    initPromise = createTables()
  }
  return initPromise
}

export * from "./schema"
