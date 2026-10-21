import { randomUUID } from "node:crypto";
import { DomainError } from "../../errors/domain-error";
import type { DeviceProps } from "./device-props";
import type { DeviceStatus, DeviceType } from "./device-types";

export type { DeviceProps } from "./device-props";
export type { DeviceStatus, DeviceType } from "./device-types";

export class Device {
  private readonly _id: string;
  private props: DeviceProps;

  constructor(props: DeviceProps, id?: string) {
    if (!props.name.trim()) {
      throw new DomainError("Device name cannot be empty.");
    }

    if (!props.location.trim()) {
      throw new DomainError("Device location cannot be empty.");
    }

    this._id = id ?? randomUUID();

    this.props = {
      ...props,
      name: props.name.trim(),
      location: props.location.trim(),
    };
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this.props.name;
  }

  public get type(): DeviceType {
    return this.props.type;
  }

  public get location(): string {
    return this.props.location;
  }

  public get status(): DeviceStatus {
    return this.props.status;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public static create(
    props: Pick<DeviceProps, "name" | "type" | "location">,
  ): Device {
    return new Device({
      ...props,
      status: "ACTIVE",
      createdAt: new Date(),
    });
  }
}
