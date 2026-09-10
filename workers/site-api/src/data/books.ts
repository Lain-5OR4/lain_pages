import { desc, eq, sql } from "drizzle-orm";
import { createDb } from "../db";
import { books } from "../schema";

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;

export const getBooks = async (d1: D1Database): Promise<Book[]> => {
  const db = createDb(d1);
  return db.select().from(books).orderBy(desc(books.updated_at), desc(books.id));
};

export const getBook = async (d1: D1Database, id: number): Promise<Book | null> => {
  const db = createDb(d1);
  const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1);
  return book ?? null;
};

export const createBook = async (d1: D1Database, input: NewBook): Promise<Book> => {
  const db = createDb(d1);
  const [book] = await db.insert(books).values(input).returning();
  return book;
};

export const updateBook = async (
  d1: D1Database,
  id: number,
  patch: Partial<NewBook>,
): Promise<Book | null> => {
  const db = createDb(d1);
  const [book] = await db
    .update(books)
    .set({ ...patch, updated_at: sql`CURRENT_TIMESTAMP` })
    .where(eq(books.id, id))
    .returning();
  return book ?? null;
};

export const deleteBook = async (d1: D1Database, id: number): Promise<boolean> => {
  const db = createDb(d1);
  const result = await db.delete(books).where(eq(books.id, id)).returning({ id: books.id });
  return result.length > 0;
};
