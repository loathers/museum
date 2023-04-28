import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment from .env
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  await prisma.player.updateMany({
    where: { missing: true },
    data: { missing: false },
  });
  await prisma.player.updateMany({
    where: { name: { startsWith: "Unknown Player #" } },
    data: { missing: true },
  });
}

main();
