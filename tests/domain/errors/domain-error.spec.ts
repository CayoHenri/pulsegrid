import { describe, expect, it } from "vitest";
import { DomainError } from "../../../src/domain/errors/domain-error.js";

describe("DomainError", () => {
  it("should preserve the message and identify the domain error", () => {
    const error = new DomainError("Invalid device");
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("DomainError");
    expect(error.message).toBe("Invalid device");
  });
});
