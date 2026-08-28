import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

function getPrismaClient(): PrismaClient {
  if (process.env.VERCEL) {
    try {
      const tmpDbPath = path.join("/tmp", "dev.db");
      const sourceDbPath = path.join(process.cwd(), "dev.db");
      const altSourceDbPath = path.join(process.cwd(), "prisma", "dev.db");

      if (!fs.existsSync(tmpDbPath)) {
        if (fs.existsSync(sourceDbPath)) {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
        } else if (fs.existsSync(altSourceDbPath)) {
          fs.copyFileSync(altSourceDbPath, tmpDbPath);
        }
      }

      if (fs.existsSync(tmpDbPath)) {
        return new PrismaClient({
          datasources: {
            db: {
              url: `file:${tmpDbPath}`,
            },
          },
        });
      }
    } catch (e) {
      console.error("Vercel tmp sqlite setup warning:", e);
    }
  }

  return new PrismaClient();
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
