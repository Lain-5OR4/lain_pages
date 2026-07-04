// Augments the auto-generated Env interface with Worker secrets.
// Secrets are set via `wrangler secret put` (never committed).
// For local dev, copy .dev.vars.example → .dev.vars and fill in the values.
interface Env {
	MICROCMS_SERVICE_DOMAIN: string;
	MICROCMS_API_KEY: string;
}
