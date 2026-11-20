import { InvalidPaginationParameterError } from "./pagination-errors.js";

export function encodeCursor<TCursor>(cursor: TCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

export function decodeCursor<TCursor>(
  token: string,
  isCursor: (value: unknown) => value is TCursor,
): TCursor {
  if (!/^[A-Za-z0-9_-]+$/.test(token)) throw new InvalidCursorError();

  try {
    const value: unknown = JSON.parse(
      Buffer.from(token, "base64url").toString("utf8"),
    );
    if (isCursor(value)) return value;
  } catch {
    // Convert malformed tokens to a stable client input error.
  }

  throw new InvalidCursorError();
}

export class InvalidCursorError extends InvalidPaginationParameterError {
  constructor() {
    super("The cursor is invalid.");
    this.name = "InvalidCursorError";
  }
}
