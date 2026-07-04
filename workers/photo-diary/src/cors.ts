import type { MiddlewareHandler } from "hono";

// Single allowlist for every public API route (/api/*, /api/blog/*).
const ALLOWED_ORIGINS = new Set([
	"https://mizora.dev",
	"http://localhost:3000",
	"http://localhost:3001",
]);

// Reflects the Origin back only for allowed origins; responses stay
// header-free for everyone else.
export const corsMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
	const origin = c.req.header("Origin") ?? "";
	await next();
	if (ALLOWED_ORIGINS.has(origin)) {
		c.header("Access-Control-Allow-Origin", origin);
		c.header("Vary", "Origin");
	}
};

export const preflight = () => new Response(null, { status: 204 });
