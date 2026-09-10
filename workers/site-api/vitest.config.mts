import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
	test: {
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.jsonc' },
				miniflare: {
					// Deterministic microCMS credentials for blog proxy tests
					// (overrides whatever is in .dev.vars).
					bindings: {
						MICROCMS_SERVICE_DOMAIN: 'test-service',
						MICROCMS_API_KEY: 'test-key',
					},
				},
			},
		},
	},
});
