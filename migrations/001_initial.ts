import type { Kysely } from "kysely";

import type { Database } from "../app/db.types";
import {
  createCollectionTable,
  createDailyCollectionTable,
  createItemSeenTable,
  createItemTable,
  createPlayerNameChangeTable,
  createPlayerTable,
  createSettingTable,
} from "../app/schema";

export async function up(db: Kysely<Database>): Promise<void> {
  // Create Setting table first (no dependencies)
  await createSettingTable(db).execute();

  // Create Item table (referenced by ItemSeen and Collection)
  await createItemTable(db).execute();

  // Create ItemSeen table (references Item)
  await createItemSeenTable(db).execute();

  // Create Player table (referenced by PlayerNameChange and Collection)
  await createPlayerTable(db, "Player").execute();

  // Create PlayerNameChange table (references Player)
  await createPlayerNameChangeTable(db).execute();

  // Create Collection table (references Item and Player, but FKs added by ETL)
  await createCollectionTable(db, "Collection").execute();

  // Create DailyCollection table
  await createDailyCollectionTable(db).execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("DailyCollection").ifExists().cascade().execute();
  await db.schema.dropTable("Collection").ifExists().cascade().execute();
  await db.schema.dropTable("PlayerNameChange").ifExists().cascade().execute();
  await db.schema.dropTable("Player").ifExists().cascade().execute();
  await db.schema.dropTable("ItemSeen").ifExists().cascade().execute();
  await db.schema.dropTable("Item").ifExists().cascade().execute();
  await db.schema.dropTable("Setting").ifExists().cascade().execute();
}
