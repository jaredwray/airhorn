import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		setupFiles: ["./test/setup.ts"],
		coverage: {
			reporter: ["text", "json", "lcov"],
			exclude: ["**/node_modules/**", "**/dist/**", "**/test/**", "vitest.config.ts"],
		},
	},
});