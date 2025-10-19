import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Configure Prisma with appropriate settings for Azure PostgreSQL
const prismaClientConfig = {
  log: process.env.NODE_ENV === "production" ? ["error", "warn"] : ["error", "warn", "info"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};

export const prisma =
  globalForPrisma.prisma || new PrismaClient(prismaClientConfig);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
