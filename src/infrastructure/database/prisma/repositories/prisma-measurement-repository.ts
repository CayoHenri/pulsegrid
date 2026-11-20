import { db } from "../../../../../prisma/db.js";
import { Measurement } from "../../../../domain/entities/measurement/measurement.js";
import { MeasurementRepository } from "../../../../domain/repositories/measurement-repository.js";
import { PrismaMeasurementMapper } from "../mappers/prisma-measurement-mapper.js";
import type { FindMeasurementsOptions } from "../../../../domain/repositories/measurement-repository.js";

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

  public async findByDeviceId(
    options: FindMeasurementsOptions,
  ): Promise<Measurement[]> {
    let query = db.orm.public.Measurement.where({ deviceId: options.deviceId });

    if (options.from) {
      query = query.where((measurement) =>
        measurement.recordedAt.gte(options.from!.toISOString()),
      );
    }
    if (options.to) {
      query = query.where((measurement) =>
        measurement.recordedAt.lte(options.to!.toISOString()),
      );
    }

    const orderedQuery = query.orderBy([
      (measurement) => measurement.recordedAt.desc(),
      (measurement) => measurement.id.desc(),
    ]);

    const rawMeasurements = options.cursor
      ? await orderedQuery.cursor(options.cursor).limit(options.limit).all()
      : await orderedQuery.limit(options.limit).all();

    return rawMeasurements.map(PrismaMeasurementMapper.toDomain);
  }
}
