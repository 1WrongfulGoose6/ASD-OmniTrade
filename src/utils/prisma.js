import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!');
  console.error('💡 Create a .env.local file with DATABASE_URL');
  console.error('   For local development, use: DATABASE_URL="file:./prisma/dev.db"');
  console.error('   See .env.example for reference');
}

// Configure Prisma with appropriate settings for Azure PostgreSQL
const prismaClientConfig = {
  log: process.env.NODE_ENV === "production" ? ["error", "warn"] : ["error", "warn", "info"],
};

// Only add datasources config if DATABASE_URL is explicitly set
// This prevents the "undefined" error while still allowing Prisma to use the env var
if (process.env.DATABASE_URL) {
  prismaClientConfig.datasources = {
    db: {
      url: process.env.DATABASE_URL,
    },
  };
}

export const prisma =
  globalForPrisma.prisma || new PrismaClient(prismaClientConfig);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
