import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";

import type { Database } from "./db.types";

declare global {
  var globalDb: Kysely<Database>;
}

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

let kysely: Kysely<Database>;

if (process.env.NODE_ENV === "production") {
  kysely = new Kysely<Database>({ dialect });
} else {
  if (!global.globalDb) {
    global.globalDb = new Kysely<Database>({
      dialect,
      log: ["query", "error"],
    });
  }
  kysely = global.globalDb;
}

export const db = kysely;

export async function getMaxAge() {
  const result = await db
    .selectFrom("Setting")
    .select("value")
    .where("key", "=", "nextUpdate")
    .executeTakeFirst();

  if (!result?.value) return 1800;

  const secondsLeft = Math.ceil((Number(result.value) - Date.now()) / 1000);
  return Math.max(0, secondsLeft);
}
