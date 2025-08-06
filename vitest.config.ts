import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		coverage: {
			exclude: [
				'src/subscription.ts',
				'dist/**',
				'site/**',
				'test/**',
				'vitest.config.ts',
			],
		},
	},
});
