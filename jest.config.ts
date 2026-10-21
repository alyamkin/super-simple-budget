import type { Config } from "jest";
import nextJest from "next/jest.js";

// Loads next.config.ts and .env files, and transforms with the Next.js compiler.
const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  coverageProvider: "v8",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

// Exported this way so next/jest can load the (async) Next.js config.
export default createJestConfig(config);
