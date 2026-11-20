export interface CursorPaginationOptions<TCursor> {
  limit: number;
  cursor?: TCursor;
}

export interface CursorPage<TItem> {
  items: TItem[];
  nextCursor: string | null;
  hasMore: boolean;
}
