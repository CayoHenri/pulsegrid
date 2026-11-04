import { db } from "../../../../prisma/db";
import { DatabaseHealthCheck } from "../../../application/ports/database-health-check";

export class PrismaDatabaseHealthCheck implements DatabaseHealthCheck {
  async ping(): Promise<void> {
    await db.query(
      db.raw.sql`SELECT 1 AS ping`.returnsRow({ ping: "pg/int4@1" }).build(),
    );
  }
}
