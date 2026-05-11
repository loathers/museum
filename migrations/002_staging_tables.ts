import { sql, type Kysely } from "kysely";

import type { Database } from "../app/db.types";

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("PlayerNew")
    .ifNotExists()
    .addColumn("playerid", "integer", (col) => col.primaryKey())
    .addColumn("name", "text")
    .addColumn("clan", "integer")
    .addColumn("description", "text")
    .execute();

  await db.schema
    .createTable("UnrankedCollection")
    .ifNotExists()
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("playerid", "integer", (col) => col.notNull())
    .addColumn("itemid", "integer", (col) => col.notNull())
    .addColumn("quantity", "integer", (col) => col.notNull())
    .addColumn("rank", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("lastupdated", "timestamp", (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .execute();

  await db.schema
    .createTable("ItemStaging")
    .ifNotExists()
    .addColumn("itemid", "integer", (col) => col.notNull())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("picture", "text", (col) => col.notNull().defaultTo("nopic"))
    .addColumn("descid", "integer")
    .addColumn("description", "text")
    .addColumn("type", "text")
    .addColumn("itemclass", "text")
    .addColumn("candiscard", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("cantransfer", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("quest", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("gift", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("smith", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("cook", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("cocktail", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("jewelry", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("hands", "integer", (col) => col.notNull().defaultTo(1))
    .addColumn("multiuse", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("sellvalue", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("power", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("quest2", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("mrstore", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("plural", "text")
    .addColumn("ambiguous", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("missing", "boolean", (col) => col.notNull().defaultTo(false))
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ItemStaging").ifExists().execute();
  await db.schema.dropTable("UnrankedCollection").ifExists().execute();
  await db.schema.dropTable("PlayerNew").ifExists().execute();
}
