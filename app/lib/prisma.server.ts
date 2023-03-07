import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

declare global {
  var __db: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
  prisma.$connect();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient({
      log: [
        {
          emit: "event",
          level: "query",
        },
      ],
    });
    global.__db.$connect();

    global.__db.$on("query" as any, async (e) => {
      if ("query" in e) console.log(`${e.query} ${e.params}`);
    });
  }
  prisma = global.__db;
}

export { prisma };
