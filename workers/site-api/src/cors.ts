import type { MiddlewareHandler } from "hono";

const ALLOWED_ORIGINS = new Set([
  "https://mizora.dev",
  "http://localhost:3000",
  "http://localhost:3001",
]);

export const corsMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const origin = c.req.header("Origin") ?? "";
  await next();
  if (ALLOWED_ORIGINS.has(origin)) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Vary", "Origin");
  }
};

export const preflight: MiddlewareHandler<{ Bindings: Env }> = async (c) => {
  const origin = c.req.header("Origin") ?? "";
  const headers = new Headers();
  if (ALLOWED_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    headers.set("Access-Control-Max-Age", "86400");
  }
  return new Response(null, { status: 204, headers });
};
