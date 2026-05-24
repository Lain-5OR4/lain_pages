import { Hono } from "hono";
import adminRoutes from "./routes/admin";
import apiRoutes from "./routes/api";
import publicRoutes from "./routes/public";

const app = new Hono<{ Bindings: Env }>();

app.route("/api", apiRoutes);
app.route("/admin", adminRoutes);
app.route("/", publicRoutes);

export default app;
