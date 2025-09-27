import { PrismaClient } from "@prisma/client";

declare global {
  var globalPrisma: PrismaClient;
}

let prisma: PrismaClient<object, "query">;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
  prisma.$connect();
} else {
  if (!global.globalPrisma) {
    global.globalPrisma = new PrismaClient({
      log: [
        {
          emit: "event",
          level: "query",
        },
      ],
    });
  }
  prisma = global.globalPrisma;

  prisma.$on("query", async (e) => {
    console.log(`${e.query} ${e.params}`);
  });
}

export const db = prisma;

export async function getMaxAge() {
  const { value } =
    (await prisma.setting.findFirst({
      where: { key: "nextUpdate" },
    })) ?? {};
  if (!value) return 1800;

  const secondsLeft = Math.ceil((Number(value) - Date.now()) / 1000);
  return Math.max(0, secondsLeft);
}
