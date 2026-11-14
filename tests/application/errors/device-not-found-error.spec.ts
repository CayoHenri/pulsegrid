import { describe, expect, it } from "vitest";
import { DeviceNotFoundError } from "../../../src/application/errors/device-not-found-error";

describe("DeviceNotFoundError", () => {
  it("should identify the error and include the missing device ID", () => {
    const error = new DeviceNotFoundError("missing-id");
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("DeviceNotFoundError");
    expect(error.message).toBe('Device with id "missing-id" was not found.');
  });
});
