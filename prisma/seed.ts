import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";
import { ITEMS } from "./data/items";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@miracle.bot" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@miracle.bot",
      passwordHash: await hashPassword("miracle123"),
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "membro@miracle.bot" },
    update: {},
    create: {
      name: "Membro",
      email: "membro@miracle.bot",
      passwordHash: await hashPassword("miracle123"),
      role: "MEMBER",
    },
  });

  const [, , carla] = await Promise.all([
    prisma.player.create({
      data: {
        name: "Alice",
        level: 142,
        vocation: "Elite Knight",
        guild: "Synthesis",
        status: "ONLINE",
        residence: "Thais",
        lastScanAt: new Date(),
        scannedById: admin.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Bruno",
        level: 137,
        vocation: "Master Sorcerer",
        guild: "Synthesis",
        status: "ONLINE",
        residence: "Venore",
        lastScanAt: new Date(),
        scannedById: admin.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Carla",
        level: 151,
        vocation: "Royal Paladin",
        guild: "Synthesis",
        status: "OFFLINE",
        residence: "Thais",
        lastScanAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        scannedById: admin.id,
      },
    }),
  ]);

  const [kastor, wraith] = await Promise.all([
    prisma.enemy.create({
      data: {
        name: "Kastor",
        level: 267,
        vocation: "Elite Knight",
        guild: "Destructive Behavior",
        residence: "Darashia",
        status: "ONLINE",
        notes: "Suspeita de múltiplas alts — ver aba de detalhes.",
        createdById: admin.id,
      },
    }),
    prisma.enemy.create({
      data: {
        name: "Nightblade",
        level: 198,
        vocation: "Master Sorcerer",
        guild: "Redd Alliance",
        residence: "Venore",
        status: "OFFLINE",
        createdById: admin.id,
      },
    }),
  ]);

  await prisma.xpRecord.createMany({
    data: [
      { enemyId: kastor.id, level: 260, xpGained: 850_000, note: "Scan diário" },
      { enemyId: kastor.id, level: 267, xpGained: 1_200_000, note: "Scan diário" },
      { enemyId: wraith.id, level: 198, note: "Primeiro scan" },
    ],
  });

  await prisma.deathEvent.create({
    data: {
      subjectType: "ENEMY",
      enemyId: wraith.id,
      killedBy: "Alice",
      cause: "Sword fight",
      location: "Venore",
    },
  });
  await prisma.deathEvent.create({
    data: {
      subjectType: "ALLY",
      playerId: carla.id,
      killedBy: "Kastor",
      cause: "Emboscada",
      location: "Darashia",
    },
  });

  // Catálogo de itens (Loot search) — scraped de miracle74.com/?subtopic=items.
  // Item por item porque cada um pode ter uma lista de preços de NPC aninhada.
  for (const item of ITEMS) {
    await prisma.item.upsert({
      where: { sourceId: item.sourceId },
      update: {},
      create: {
        sourceId: item.sourceId,
        name: item.name,
        category: item.category,
        weight: item.weight,
        attack: item.attack,
        defense: item.defense,
        npcPrices: item.npcPrices
          ? {
              create: item.npcPrices.map((p) => ({
                npcName: p.npc,
                city: p.city,
                price: p.price,
              })),
            }
          : undefined,
      },
    });
  }

  console.log("Seed concluído. Contas de exemplo:");
  console.log("  admin: admin@miracle.bot / miracle123 (ADMIN)");
  console.log("  membro: membro@miracle.bot / miracle123 (MEMBER)");
  console.log(`  catálogo de itens: ${ITEMS.length} itens`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
