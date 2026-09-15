import { finishPostDeletion, getPostDeletion, stagePostDeletion } from "../data/post-deletions";

export class PostDeletionError extends Error {
  constructor(
    cause: unknown,
    readonly postId: number,
    readonly step: "database" | "images" | "finalize",
  ) {
    super("Failed to delete post", { cause });
    this.name = "PostDeletionError";
  }
}

export async function deletePost(
  storage: Pick<Env, "DB" | "BUCKET">,
  postId: number,
): Promise<boolean> {
  try {
    await stagePostDeletion(storage.DB, postId);
  } catch (cause) {
    throw new PostDeletionError(cause, postId, "database");
  }
  return cleanupPostImages(storage, postId);
}

export async function cleanupPostImages(
  storage: Pick<Env, "DB" | "BUCKET">,
  postId: number,
): Promise<boolean> {
  let step: PostDeletionError["step"] = "database";
  try {
    const pending = await getPostDeletion(storage.DB, postId);
    if (!pending) return false;
    const keys: unknown = JSON.parse(pending.image_keys);
    if (!Array.isArray(keys) || !keys.every((key): key is string => typeof key === "string")) {
      throw new Error("Invalid image cleanup record");
    }
    step = "images";
    // Keep the complete record until all chunks succeed. R2 deletion of an
    // already absent object is safe, so a retry can repeat every chunk.
    for (let i = 0; i < keys.length; i += 100) {
      await storage.BUCKET.delete(keys.slice(i, i + 100));
    }
    step = "finalize";
    const result = await finishPostDeletion(storage.DB, postId, pending.image_keys);
    // Another failed upload may have added keys while these objects were being
    // deleted. Never clear newer work; leave it available for the next retry.
    if (result.meta.changes === 0 && (await getPostDeletion(storage.DB, postId))) {
      throw new Error("Cleanup record changed; retry remaining work");
    }
    return true;
  } catch (cause) {
    throw new PostDeletionError(cause, postId, step);
  }
}
