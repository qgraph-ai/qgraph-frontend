import path from "node:path"

import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".next", "tests/e2e/**"],
    css: false,
    env: {
      NEXT_PUBLIC_API_URL: "http://127.0.0.1:8000",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.server.ts",
        "src/**/index.ts",
        "src/**/types.ts",
        "src/components/ui/**",
        "src/**/__tests__/**",
        "src/app/**/loading.tsx",
        "src/app/**/error.tsx",
      ],
      thresholds: {
        statements: 85,
        lines: 85,
        functions: 85,
        branches: 75,
      },
    },
  },
})
