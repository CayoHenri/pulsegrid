import { decodeCursor, encodeCursor } from "./cursor-token.js";
import type { MeasurementCursor } from "../../domain/repositories/measurement-repository.js";

export type { MeasurementCursor } from "../../domain/repositories/measurement-repository.js";

export function encodeMeasurementCursor(cursor: MeasurementCursor): string {
  return encodeCursor(cursor);
}

export function decodeMeasurementCursor(value: string): MeasurementCursor {
  return decodeCursor(value, isMeasurementCursor);
}

function isMeasurementCursor(value: unknown): value is MeasurementCursor {
  if (typeof value !== "object" || value === null) return false;
  const cursor = value as Record<string, unknown>;
  const recordedAt = cursor.recordedAt;
  const isIsoTimestamp =
    typeof recordedAt === "string" &&
    Number.isFinite(Date.parse(recordedAt)) &&
    new Date(recordedAt).toISOString() === recordedAt;

  return (
    typeof cursor.id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cursor.id) &&
    isIsoTimestamp
  );
}
