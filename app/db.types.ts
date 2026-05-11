import type { ColumnType, Generated, Selectable, Insertable } from "kysely";

// Setting table
export interface SettingTable {
  key: string;
  value: string;
}

// Collection table
export interface CollectionTable {
  id: Generated<number>;
  playerid: number;
  itemid: number;
  quantity: number;
  rank: number;
  lastupdated: ColumnType<Date, Date | undefined, Date>;
}

// Item table
export interface ItemTable {
  itemid: number;
  name: string;
  picture: ColumnType<string, string | undefined, string>;
  descid: number | null;
  description: string | null;
  type: string | null;
  itemclass: string | null;
  candiscard: ColumnType<boolean, boolean | undefined, boolean>;
  cantransfer: ColumnType<boolean, boolean | undefined, boolean>;
  quest: ColumnType<boolean, boolean | undefined, boolean>;
  gift: ColumnType<boolean, boolean | undefined, boolean>;
  smith: ColumnType<boolean, boolean | undefined, boolean>;
  cook: ColumnType<boolean, boolean | undefined, boolean>;
  cocktail: ColumnType<boolean, boolean | undefined, boolean>;
  jewelry: ColumnType<boolean, boolean | undefined, boolean>;
  hands: ColumnType<number, number | undefined, number>;
  multiuse: ColumnType<boolean, boolean | undefined, boolean>;
  sellvalue: ColumnType<number, number | undefined, number>;
  power: ColumnType<number, number | undefined, number>;
  quest2: ColumnType<boolean, boolean | undefined, boolean>;
  mrstore: ColumnType<boolean, boolean | undefined, boolean>;
  plural: string | null;
  ambiguous: ColumnType<boolean, boolean | undefined, boolean>;
  missing: ColumnType<boolean, boolean | undefined, boolean>;
}

// Player table
export interface PlayerTable {
  playerid: number;
  name: string;
  clan: number | null;
  description: string | null;
}

// PlayerNameChange table
export interface PlayerNameChangeTable {
  id: Generated<number>;
  playerid: number;
  oldname: string;
  when: ColumnType<Date, Date | undefined, Date>;
}

// DailyCollection table
export interface DailyCollectionTable {
  itemid: number;
  name: string;
  plural: string | null;
  players: unknown; // JSON type
}

// UnrankedCollection table
export interface UnrankedCollectionTable {
  id: Generated<number>;
  playerid: number;
  itemid: number;
  quantity: number;
  lastupdated: ColumnType<Date, Date | undefined, Date>;
}

// ItemSeen table
export interface ItemSeenTable {
  itemid: number;
  when: ColumnType<Date, Date | undefined, Date>;
}

// ItemStaging table — mirrors Item but without PK constraint
export interface ItemStagingTable {
  itemid: number;
  name: string;
  picture: ColumnType<string, string | undefined, string>;
  descid: number | null;
  description: string | null;
  type: string | null;
  itemclass: string | null;
  candiscard: ColumnType<boolean, boolean | undefined, boolean>;
  cantransfer: ColumnType<boolean, boolean | undefined, boolean>;
  quest: ColumnType<boolean, boolean | undefined, boolean>;
  gift: ColumnType<boolean, boolean | undefined, boolean>;
  smith: ColumnType<boolean, boolean | undefined, boolean>;
  cook: ColumnType<boolean, boolean | undefined, boolean>;
  cocktail: ColumnType<boolean, boolean | undefined, boolean>;
  jewelry: ColumnType<boolean, boolean | undefined, boolean>;
  hands: ColumnType<number, number | undefined, number>;
  multiuse: ColumnType<boolean, boolean | undefined, boolean>;
  sellvalue: ColumnType<number, number | undefined, number>;
  power: ColumnType<number, number | undefined, number>;
  quest2: ColumnType<boolean, boolean | undefined, boolean>;
  mrstore: ColumnType<boolean, boolean | undefined, boolean>;
  plural: string | null;
  ambiguous: ColumnType<boolean, boolean | undefined, boolean>;
  missing: ColumnType<boolean, boolean | undefined, boolean>;
}

// Database interface combining all tables
export interface Database {
  Setting: SettingTable;
  Collection: CollectionTable;
  Item: ItemTable;
  ItemStaging: ItemStagingTable;
  Player: PlayerTable;
  PlayerNameChange: PlayerNameChangeTable;
  DailyCollection: DailyCollectionTable;
  UnrankedCollection: UnrankedCollectionTable;
  ItemSeen: ItemSeenTable;
}

// Helper types for each table
export type Setting = Selectable<SettingTable>;
export type NewSetting = Insertable<SettingTable>;

export type Collection = Selectable<CollectionTable>;
export type NewCollection = Insertable<CollectionTable>;

export type Item = Selectable<ItemTable>;
export type NewItem = Insertable<ItemTable>;

export type Player = Selectable<PlayerTable>;
export type NewPlayer = Insertable<PlayerTable>;
export type SlimPlayer = Pick<Player, "playerid" | "name">;

export type PlayerNameChange = Selectable<PlayerNameChangeTable>;
export type NewPlayerNameChange = Insertable<PlayerNameChangeTable>;

export type DailyCollection = Selectable<DailyCollectionTable>;
export type NewDailyCollection = Insertable<DailyCollectionTable>;

export type ItemSeen = Selectable<ItemSeenTable>;
export type NewItemSeen = Insertable<ItemSeenTable>;
