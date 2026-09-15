import { fileURLToPath } from 'node:url';
import { defineWorkersConfig, readD1Migrations } from '@cloudflare/vitest-pool-workers/config';

const migrations = await readD1Migrations(fileURLToPath(new URL('./migrations', import.meta.url)));

export default defineWorkersConfig({
	test: {
		setupFiles: ['./test/setup.ts'],
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.jsonc' },
				miniflare: {
					d1Databases: { MIGRATION_TEST_DB: { id: 'migration-test-db' } },
					// Deterministic microCMS credentials for blog proxy tests
					// (overrides whatever is in .dev.vars).
					bindings: {
						TEST_MIGRATIONS: migrations,
						MICROCMS_SERVICE_DOMAIN: 'test-service',
						MICROCMS_API_KEY: 'test-key',
					},
				},
			},
		},
	},
});
