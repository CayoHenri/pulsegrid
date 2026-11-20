import { DeviceRepository } from "../../../domain/repositories/device-repository.js";
import { MeasurementRepository } from "../../../domain/repositories/measurement-repository.js";
import { DeviceNotFoundError } from "../../errors/device-not-found-error.js";
import type { Measurement } from "../../../domain/entities/measurement/measurement.js";
import {
  MeasurementOutput,
  toMeasurementOutput,
} from "../measurement-output.js";
import { ListMeasurementsByDeviceInput } from "./list-measurements-by-device-input.js";
import { CursorPagination } from "../../pagination/cursor-pagination.js";
import { InvalidPaginationParameterError } from "../../pagination/pagination-errors.js";
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from "../../pagination/pagination-limits.js";
import type { CursorPage } from "../../../domain/pagination/cursor-pagination.js";
import { InvalidMeasurementDateRangeError } from "../../errors/invalid-measurement-date-range-error.js";
import {
  decodeMeasurementCursor,
  encodeMeasurementCursor,
} from "../../pagination/measurement-cursor.js";

export class ListMeasurementsByDeviceUseCase {
  constructor(
    private readonly deviceRepository: DeviceRepository,
    private readonly measurementRepository: MeasurementRepository,
  ) {}

  public async execute(
    input: ListMeasurementsByDeviceInput,
  ): Promise<CursorPage<MeasurementOutput>> {
    const device = await this.deviceRepository.findById(input.deviceId);
    if (!device) throw new DeviceNotFoundError(input.deviceId);

    const limit = input.limit ?? DEFAULT_PAGE_LIMIT;
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_LIMIT) {
      throw new InvalidPaginationParameterError(
        `Limit must be an integer between 1 and ${MAX_PAGE_LIMIT}.`,
      );
    }

    const from = input.from === undefined ? undefined : new Date(input.from);
    const to = input.to === undefined ? undefined : new Date(input.to);
    if (from && Number.isNaN(from.getTime()))
      throw new InvalidPaginationParameterError(
        '"from" must be a valid date-time.',
      );
    if (to && Number.isNaN(to.getTime()))
      throw new InvalidPaginationParameterError(
        '"to" must be a valid date-time.',
      );
    if (from && to && from > to) throw new InvalidMeasurementDateRangeError();

    const cursor = input.cursor
      ? decodeMeasurementCursor(input.cursor)
      : undefined;
    const pagination = new CursorPagination<Measurement>(limit, (measurement) =>
      encodeMeasurementCursor({
        recordedAt: measurement.recordedAt.toISOString(),
        id: measurement.id,
      }),
    );
    const measurements = await this.measurementRepository.findByDeviceId({
      deviceId: input.deviceId,
      limit: pagination.fetchLimit,
      from,
      to,
      cursor,
    });
    const page = pagination.createPage(measurements);

    return { ...page, items: page.items.map(toMeasurementOutput) };
  }
}
