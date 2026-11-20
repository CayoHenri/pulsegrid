import { CreateInput } from "@prisma/orm-postgres/orm-client";
import type { Scalars } from "@prisma/orm-postgres/family-contract/types";
import { Contract, Models } from "../../../../../prisma/contract.js";
import { Measurement } from "../../../../domain/entities/measurement/measurement.js";

type PrismaMeasurementRecord = Scalars<Models.public_Measurement>;
type PrismaMeasurementInput = CreateInput<Contract, "Measurement">;

export class PrismaMeasurementMapper {
  public static toDomain(raw: PrismaMeasurementRecord): Measurement {
    return Measurement.restore({
      createdAt: new Date(raw.createdAt),
      deviceId: raw.deviceId,
      id: raw.id,
      recordedAt: new Date(raw.recordedAt),
      value: raw.value,
    });
  }

  public static toPersistence(
    measurement: Measurement,
  ): PrismaMeasurementInput {
    return {
      id: measurement.id,
      deviceId: measurement.deviceId,
      value: measurement.value,
      recordedAt: measurement.recordedAt.toISOString(),
      createdAt: measurement.createdAt.toISOString(),
    };
  }
}
