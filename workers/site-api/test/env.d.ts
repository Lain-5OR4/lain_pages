declare module "cloudflare:test" {
  interface ProvidedEnv extends Env {
    TEST_MIGRATIONS: import("cloudflare:test").D1Migration[];
    MIGRATION_TEST_DB: D1Database;
  }
}
