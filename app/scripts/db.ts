import pg from "pg";

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) throw Error("Must specify a database URL");

export const pool = new pg.Pool({
  connectionString: DATABASE_URL,
});

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}
