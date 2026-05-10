import { defineConfig } from "kysely-ctl";
import { db } from "./app/db.server";

export default defineConfig({
  kysely: db,
  migrations: {
    migrationFolder: "migrations",
  },
});
