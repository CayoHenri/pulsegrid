import { describe, expect, it } from "vitest";
import { CursorPagination } from "../../../src/application/pagination/cursor-pagination.js";
import { decodeCursor, encodeCursor, InvalidCursorError } from "../../../src/application/pagination/cursor-token.js";

describe("generic cursor pagination", () => {
  it("builds a page and encodes its last item's cursor only when more items exist", () => {
    const records = [{ id: "3" }, { id: "2" }, { id: "1" }];
    const pagination = new CursorPagination<(typeof records)[number]>(
      2,
      (record) => encodeCursor({ id: record.id }),
    );
    const page = pagination.createPage(records);

    expect(pagination.fetchLimit).toBe(3);
    expect(page).toEqual({
      items: records.slice(0, 2),
      nextCursor: encodeCursor({ id: "2" }),
      hasMore: true,
    });
    expect(pagination.createPage(records.slice(0, 2))).toEqual({
      items: records.slice(0, 2),
      nextCursor: null,
      hasMore: false,
    });
  });

  it("decodes a generic cursor and rejects malformed cursor values", () => {
    const token = encodeCursor({ id: "measurement-1", sequence: 4 });
    const isCursor = (value: unknown): value is { id: string; sequence: number } =>
      typeof value === "object" && value !== null &&
      typeof (value as { id?: unknown }).id === "string" &&
      typeof (value as { sequence?: unknown }).sequence === "number";

    expect(decodeCursor(token, isCursor)).toEqual({ id: "measurement-1", sequence: 4 });
    expect(() => decodeCursor("broken", isCursor)).toThrow(InvalidCursorError);
    expect(() => decodeCursor(encodeCursor({ id: "bad" }), isCursor)).toThrow(InvalidCursorError);
  });
});
