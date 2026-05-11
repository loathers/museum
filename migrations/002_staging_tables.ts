import type { Kysely } from "kysely";

import type { Database } from "../app/db.types";
import {
  createCollectionTable,
  createItemStagingTable,
  createPlayerTable,
} from "../app/schema";

export async function up(db: Kysely<Database>): Promise<void> {
  await createPlayerTable(db, "PlayerNew").execute();
  await createCollectionTable(db, "UnrankedCollection").execute();
  await createItemStagingTable(db).execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ItemStaging").ifExists().execute();
  await db.schema.dropTable("UnrankedCollection").ifExists().execute();
  await db.schema.dropTable("PlayerNew").ifExists().execute();
}
