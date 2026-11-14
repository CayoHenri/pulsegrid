import { randomUUID } from "node:crypto";
import {
  CreateMeasurementProps,
  RestoreMeasurementProps,
} from "./measurement-props";

export class Measurement {
  private constructor(
    public readonly id: string,
    public readonly deviceId: string,
    public readonly value: number,
    public readonly recordedAt: Date,
    public readonly createdAt: Date,
  ) {
    if (!deviceId.trim()) {
      throw new Error("Device ID is required");
    }

    if (!Number.isFinite(value)) {
      throw new Error("Measurement value must be finite");
    }

    if (Number.isNaN(recordedAt.getTime())) {
      throw new Error("Invalid measurement date");
    }
  }

  public static create(props: CreateMeasurementProps): Measurement {
    return new Measurement(
      randomUUID(),
      props.deviceId,
      props.value,
      new Date(props.recordedAt),
      new Date(),
    );
  }

  public static restore(props: RestoreMeasurementProps): Measurement {
    return new Measurement(
      props.id,
      props.deviceId,
      props.value,
      new Date(props.recordedAt),
      new Date(props.createdAt),
    );
  }
}
