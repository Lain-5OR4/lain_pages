import { Hono } from "hono";
import bookRoutes from "./books";
import postRoutes from "./posts";

const admin = new Hono<{ Bindings: Env }>();
admin.route("/", postRoutes);
admin.route("/", bookRoutes);

export default admin;
