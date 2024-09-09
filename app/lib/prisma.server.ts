import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var __db: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
  prisma.$connect();
} else {
  if (!global.__db) {
    const client = new PrismaClient({
      log: [
        {
          emit: "event",
          level: "query",
        },
      ],
    });
    client.$connect();

    client.$on("query", async (e) => {
      console.log(`${e.query} ${e.params}`);
    });
    global.__db = client;
  }
  prisma = global.__db;
}

export { prisma };
