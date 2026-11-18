import { db } from "../../../../../prisma/db";
import { Measurement } from "../../../../domain/entities/measurement/measurement";
import { MeasurementRepository } from "../../../../domain/repositories/measurement-repository";
import { PrismaMeasurementMapper } from "../mappers/prisma-measurement-mapper";

export class PrismaMeasurementRepository implements MeasurementRepository {
  public async create(measurement: Measurement): Promise<void> {
    await db.orm.public.Measurement.create(
      PrismaMeasurementMapper.toPersistence(measurement),
    );
  }

  public async findById(id: string): Promise<Measurement | null> {
    const raw = await db.orm.public.Measurement.where({ id }).first();

    return raw ? PrismaMeasurementMapper.toDomain(raw) : null;
  }

  async findByDeviceId(deviceId: string): Promise<Measurement[]> {
    const rawMeasurements = await db.orm.public.Measurement.orderBy([
      (measurement) => measurement.recordedAt.desc(),
      (measurement) => measurement.id.desc(),
    ])
      .where({ deviceId })
      .all();

    return rawMeasurements.map(PrismaMeasurementMapper.toDomain);
  }
}
