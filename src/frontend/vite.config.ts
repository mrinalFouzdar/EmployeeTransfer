/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const r = (spec: string) => fileURLToPath(new URL(`./node_modules/${spec}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Test files live outside src/frontend/ (tests/frontend/, at the repo root) so Node's
      // ordinary upward node_modules lookup from their real disk location never reaches
      // this project's node_modules. Only the packages test files import directly need this.
      "@testing-library/react": r("@testing-library/react"),
      "@testing-library/jest-dom": r("@testing-library/jest-dom"),
      "react-router-dom": r("react-router-dom"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
    fs: {
      // tests/frontend/ lives two levels up (repo root), outside this Vite project's root -
      // must be explicitly allowed or Vite's dev-server file-serving guard blocks it.
      allow: ["../.."],
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Tests live under the repo-root tests/frontend/ (mirrors tests/backend/'s
    // convention), not alongside src/frontend/ - so an explicit include is needed.
    include: ["../../tests/frontend/**/*.test.{ts,tsx}"],
  },
});
