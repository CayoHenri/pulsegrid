import { db } from "../../../../prisma/db.js";
import { DatabaseHealthCheck } from "../../../application/ports/database-health-check.js";

export class PrismaDatabaseHealthCheck implements DatabaseHealthCheck {
  async ping(): Promise<void> {
    await db.query(
      db.raw.sql`SELECT 1 AS ping`.returnsRow({ ping: "pg/int4@1" }).build(),
    );
  }
}
