import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const envTestPath = resolve(process.cwd(), ".env.test");

if (!process.env.CI && existsSync(envTestPath)) {
  const envTest = loadEnv({ path: envTestPath, override: true });

  if (envTest.error) {
    throw new Error(
      `Could not load integration test environment at ${envTestPath}`,
      { cause: envTest.error },
    );
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "Set DATABASE_URL for integration tests, using .env.test locally or a CI environment variable.",
  );
}

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.spec.ts"],
  },
});
