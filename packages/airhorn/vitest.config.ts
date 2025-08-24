import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		coverage: {
			reporter: ['text', 'json', 'lcov'],
			exclude: [
				'dist/**',
				'site/**',
				'test/**',
				'vitest.config.ts',
				'src/template.ts',
				'src/provider.ts'
			],
		},
	},
});
