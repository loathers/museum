import { sql, type Kysely } from "kysely";

import type { Database } from "../app/db.types";

export async function up(db: Kysely<Database>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS "Item_name_lower_idx" ON "Item" (lower("name"))`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS "Item_name_trgm_idx" ON "Item" USING GIN ("name" gin_trgm_ops)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS "Item_missing_idx" ON "Item" ("missing")`.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS "Player_name_lower_idx" ON "Player" (lower("name"))`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS "Player_name_trgm_idx" ON "Player" USING GIN ("name" gin_trgm_ops)`.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS "Collection_playerid_idx" ON "Collection" ("playerid")`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS "Collection_itemid_idx" ON "Collection" ("itemid")`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS "Collection_rank_idx" ON "Collection" ("rank")`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS "Collection_itemid_rank_idx" ON "Collection" ("itemid", "rank")`.execute(db);

  await sql`
    DO $$
    DECLARE r RECORD;
    BEGIN
      FOR r IN
        SELECT conname FROM pg_constraint
        WHERE conrelid = '"Collection"'::regclass AND contype = 'f'
      LOOP
        EXECUTE 'ALTER TABLE "Collection" DROP CONSTRAINT ' || quote_ident(r.conname);
      END LOOP;
    END;
    $$
  `.execute(db);

  await sql`
    ALTER TABLE "Collection"
      ADD CONSTRAINT "Collection_itemid_fkey" FOREIGN KEY ("itemid") REFERENCES "Item"("itemid") DEFERRABLE INITIALLY DEFERRED,
      ADD CONSTRAINT "Collection_playerid_fkey" FOREIGN KEY ("playerid") REFERENCES "Player"("playerid") DEFERRABLE INITIALLY DEFERRED
  `.execute(db);
}

export async function down(db: Kysely<Database>): Promise<void> {
  await sql`ALTER TABLE "Collection" DROP CONSTRAINT IF EXISTS "Collection_itemid_fkey"`.execute(db);
  await sql`ALTER TABLE "Collection" DROP CONSTRAINT IF EXISTS "Collection_playerid_fkey"`.execute(db);

  await sql`DROP INDEX IF EXISTS "Collection_itemid_rank_idx"`.execute(db);
  await sql`DROP INDEX IF EXISTS "Collection_rank_idx"`.execute(db);
  await sql`DROP INDEX IF EXISTS "Collection_itemid_idx"`.execute(db);
  await sql`DROP INDEX IF EXISTS "Collection_playerid_idx"`.execute(db);
  await sql`DROP INDEX IF EXISTS "Player_name_trgm_idx"`.execute(db);
  await sql`DROP INDEX IF EXISTS "Player_name_lower_idx"`.execute(db);
  await sql`DROP INDEX IF EXISTS "Item_missing_idx"`.execute(db);
  await sql`DROP INDEX IF EXISTS "Item_name_trgm_idx"`.execute(db);
  await sql`DROP INDEX IF EXISTS "Item_name_lower_idx"`.execute(db);
}
