import { sql, type Kysely } from "kysely";

import type { Database } from "./db.types";

// Player table creation (parameterized for PlayerNew table reuse)
export function createPlayerTable(db: Kysely<Database>, name: string) {
  return db.schema
    .createTable(name)
    .ifNotExists()
    .addColumn("playerid", "integer", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("clan", "integer")
    .addColumn("description", "text");
}

// Item table
export function createItemTable(db: Kysely<Database>) {
  return db.schema
    .createTable("Item")
    .ifNotExists()
    .addColumn("itemid", "integer", (col) => col.primaryKey())
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
    .addColumn("missing", "boolean", (col) => col.notNull().defaultTo(false));
}

// ItemSeen table
export function createItemSeenTable(db: Kysely<Database>) {
  return db.schema
    .createTable("ItemSeen")
    .ifNotExists()
    .addColumn("itemid", "integer", (col) =>
      col.primaryKey().references("Item.itemid"),
    )
    .addColumn("when", "date", (col) =>
      col.notNull().defaultTo(sql`CURRENT_DATE`),
    );
}

// Collection table creation (parameterized for UnrankedCollection reuse)
export function createCollectionTable(db: Kysely<Database>, name: string) {
  return db.schema
    .createTable(name)
    .ifNotExists()
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("playerid", "integer", (col) => col.notNull())
    .addColumn("itemid", "integer", (col) => col.notNull())
    .addColumn("quantity", "integer", (col) => col.notNull())
    .addColumn("rank", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("lastupdated", "timestamp", (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    );
}

// DailyCollection table
export function createDailyCollectionTable(db: Kysely<Database>) {
  return db.schema
    .createTable("DailyCollection")
    .ifNotExists()
    .addColumn("itemid", "integer", (col) => col.notNull().unique())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("plural", "text")
    .addColumn("players", "jsonb", (col) => col.notNull());
}

// PlayerNameChange table
export function createPlayerNameChangeTable(db: Kysely<Database>) {
  return db.schema
    .createTable("PlayerNameChange")
    .ifNotExists()
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("playerid", "integer", (col) =>
      col.notNull().references("Player.playerid"),
    )
    .addColumn("oldname", "text", (col) => col.notNull())
    .addColumn("when", "date", (col) =>
      col.notNull().defaultTo(sql`CURRENT_DATE`),
    )
    .addUniqueConstraint("PlayerNameChange_playerid_when_unique", [
      "playerid",
      "when",
    ]);
}

// Setting table
export function createSettingTable(db: Kysely<Database>) {
  return db.schema
    .createTable("Setting")
    .ifNotExists()
    .addColumn("key", "text", (col) => col.primaryKey())
    .addColumn("value", "text", (col) => col.notNull());
}
