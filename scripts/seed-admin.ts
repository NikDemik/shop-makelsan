/**
 * Создание администратора магазина (idempotent).
 * Запуск: npm run seed:admin
 */

import { readFileSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

function loadEnv(): void {
  const envPath = path.join(process.cwd(), ".env");
  try {
    const raw = readFileSync(envPath, "utf-8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
    }
  } catch {
    // ignore
  }
}

loadEnv();

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@makelsan-ups.ru";
const ADMIN_PASSWORD = "admin123";

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      name: "Администратор",
      role: "ADMIN",
      accountType: "B2B",
    },
    update: { role: "ADMIN", passwordHash },
  });
  console.log(`Администратор готов: ${admin.email} / ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
