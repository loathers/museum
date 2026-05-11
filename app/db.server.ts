import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";

import type { Database } from "./db.types";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const dialect = new PostgresDialect({ pool });

declare global {
  var kyselyInstance: Kysely<Database>;
}
export const db = global.kyselyInstance || new Kysely<Database>({ dialect });
if (process.env.NODE_ENV !== 'production') {
  global.kyselyInstance = db;
}

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
