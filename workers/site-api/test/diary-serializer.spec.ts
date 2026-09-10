import { expect, it } from "vitest";
import { toDiaryEntry } from "../src/serializers/diary";

it.each([
  [null, "2026-05-12 18:30:00", "'26 05 13 03:30"],
  [null, "2026-05-12T18:30:00Z", "'26 05 13 03:30"],
  [null, "2026-05-12T18:30:00+09:00", "'26 05 12 18:30"],
  ["2026-05-12T07:15:30", "2026-05-12 18:30:00", "'26 05 12 07:15"],
  ["2026-05-12T18:30:00Z", "2026-05-12 00:00:00", "'26 05 13 03:30"],
])(
  "preserves stamp conversion for taken_at=%s and created_at=%s",
  (taken_at, created_at, stamp) => {
    expect(
      toDiaryEntry(
        {
          id: 1,
          title: "",
          caption: "caption",
          posted_on: "2026-05-12",
          created_at,
          images: [{ key: "posts/1/a.jpg", taken_at }],
        },
        "https://example.com",
      ),
    ).toEqual({
      id: "1",
      title: "",
      description: "caption",
      date: "2026-05-12",
      photos: [{ src: "https://example.com/images/posts/1/a.jpg", alt: "caption", stamp }],
    });
  },
);
