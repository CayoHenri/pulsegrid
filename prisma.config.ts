import "dotenv/config";
import { definePrismaConfig } from "@prisma/cli-engine";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";

const databaseUrl = (globalThis as any).process?.env?.DATABASE_URL ?? "";

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./prisma/contract.prisma",
    db: {
      connection: databaseUrl,
    },
  }),
});
