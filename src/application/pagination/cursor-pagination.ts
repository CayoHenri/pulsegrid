import type { CursorPage } from "../../domain/pagination/cursor-pagination.js";

/** Builds a keyset page from rows fetched with one look-ahead record. */
export class CursorPagination<TItem> {
  constructor(
    public readonly limit: number,
    private readonly cursorFor: (item: TItem) => string,
  ) {}

  public get fetchLimit(): number {
    return this.limit + 1;
  }

  public createPage(records: TItem[]): CursorPage<TItem> {
    const hasMore = records.length > this.limit;
    const items = records.slice(0, this.limit);
    const lastItem = items.at(-1);

    return {
      items,
      nextCursor:
        hasMore && lastItem !== undefined ? this.cursorFor(lastItem) : null,
      hasMore,
    };
  }
}
