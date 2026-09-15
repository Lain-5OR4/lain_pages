import { and, eq } from "drizzle-orm";
import { stageFailedPostCleanup } from "../data/post-deletions";
import { createDb } from "../db";
import { postImages, posts } from "../schema";
import { mimeForExt, safeExt } from "../utils";
import { cleanupPostImages, PostDeletionError } from "./delete-post";

type Storage = Pick<Env, "DB" | "BUCKET">;
type ImageInput = { file: File; takenAt: string | null };
type CreatePostInput = {
  title: string;
  caption: string;
  posted_on: string;
  images: ImageInput[];
};
type CleanupFailure = { step: "database" | "images" | "finalize"; cause: unknown };

export class PostCreationError extends Error {
  constructor(
    cause: unknown,
    readonly postId: number | undefined,
    readonly attemptedKeys: string[],
    readonly cleanupFailures: CleanupFailure[],
    readonly uploadToken?: string,
  ) {
    super("Failed to save post", { cause });
    this.name = "PostCreationError";
  }
}

export async function createPost(storage: Storage, input: CreatePostInput): Promise<number> {
  if (input.images.length === 0) throw new Error("No images");
  const db = createDb(storage.DB);
  let postId: number | undefined;
  const attemptedKeys: string[] = [];
  const uploadToken = crypto.randomUUID();
  let plannedKeys: string[] = [];
  let publishing = false;

  try {
    const [post] = await db
      .insert(posts)
      .values({
        title: input.title,
        caption: input.caption,
        posted_on: input.posted_on,
        publication_state: "pending",
        upload_token: uploadToken,
      })
      .returning({ id: posts.id });
    postId = post.id;

    plannedKeys = input.images.map(
      (image, i) =>
        `posts/${postId}/${i}-${crypto.randomUUID().slice(0, 8)}.${safeExt(image.file.name)}`,
    );
    const active = and(
      eq(posts.id, postId),
      eq(posts.upload_token, uploadToken),
      eq(posts.publication_state, "pending"),
    );
    const recorded = await db
      .update(posts)
      .set({ upload_keys: JSON.stringify(plannedKeys) })
      .where(active)
      .returning({ id: posts.id });
    if (recorded.length === 0) throw new Error("Upload was removed");

    const imageRows: (typeof postImages.$inferInsert)[] = [];
    // Sequential uploads bound memory and ensure no put is still running when
    // rollback begins. Keep the existing key layout and attachment order.
    for (const [i, image] of input.images.entries()) {
      const ext = safeExt(image.file.name);
      const key = plannedKeys[i];
      const bytes = await image.file.arrayBuffer();
      // A put may commit before its response fails, so clean attempted keys,
      // not only keys whose put returned successfully.
      attemptedKeys.push(key);
      const object = await storage.BUCKET.put(key, bytes, {
        httpMetadata: { contentType: mimeForExt(ext) },
      });
      if (!object) throw new Error("Image upload returned no object");
      imageRows.push({
        post_id: postId,
        r2_key: key,
        sort_order: i,
        taken_at: image.takenAt,
      });
    }
    await db.insert(postImages).values(imageRows);
    publishing = true;
    const published = await db
      .update(posts)
      .set({
        publication_state: "published",
        upload_token: null,
        upload_keys: "[]",
      })
      .where(active)
      .returning({ id: posts.id });
    if (published.length === 0) throw new Error("Upload was removed before publication");
    return postId;
  } catch (cause) {
    const cleanupFailures: CleanupFailure[] = [];
    try {
      // Recover the ID if the initial insert committed but its response failed.
      if (postId === undefined) {
        const [pending] = await db
          .select({ id: posts.id })
          .from(posts)
          .where(eq(posts.upload_token, uploadToken))
          .limit(1);
        postId = pending?.id;
      }
      if (publishing && postId !== undefined) {
        const [post] = await db
          .select({ state: posts.publication_state })
          .from(posts)
          .where(eq(posts.id, postId))
          .limit(1);
        // A successful publication with a lost response is still a success.
        if (post?.state === "published") return postId;
      }
    } catch (lookupCause) {
      // An ambiguous publication must not trigger deletion of a completed post.
      throw new PostCreationError(
        cause,
        postId,
        attemptedKeys,
        [{ step: "database", cause: lookupCause }],
        uploadToken,
      );
    }
    if (postId !== undefined) {
      try {
        await stageFailedPostCleanup(storage.DB, postId, plannedKeys);
      } catch (cleanupCause) {
        cleanupFailures.push({ step: "database", cause: cleanupCause });
      }
      // If rollback cannot be confirmed, preserve images that DB rows may still
      // reference (including an image-row insert with a lost acknowledgement).
      if (cleanupFailures.length === 0) {
        try {
          await cleanupPostImages(storage, postId);
        } catch (cleanupCause) {
          cleanupFailures.push({
            step: cleanupCause instanceof PostDeletionError ? cleanupCause.step : "images",
            cause: cleanupCause,
          });
        }
      }
    }
    throw new PostCreationError(cause, postId, attemptedKeys, cleanupFailures, uploadToken);
  }
}
