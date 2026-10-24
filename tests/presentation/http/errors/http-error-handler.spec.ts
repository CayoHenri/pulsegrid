import { describe, expect, it, vi } from "vitest";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { HttpErrorHandler } from "../../../../src/presentation/http/errors/http-error-handler";
import { DomainError } from "../../../../src/domain/errors/domain-error";
import { DeviceNotFoundError } from "../../../../src/application/errors/device-not-found-error";

describe("HttpErrorHandler", () => {
  const createReply = () => {
    const reply = {
      status: vi.fn(),
      send: vi.fn(),
    };
    reply.status.mockReturnValue(reply);
    return reply;
  };

  const handle = async (error: Error & Partial<FastifyError>) => {
    const reply = createReply();
    await HttpErrorHandler.handle(
      error as FastifyError,
      {} as FastifyRequest,
      reply as unknown as FastifyReply,
    );
    return reply;
  };

  it("maps domain errors to 400", async () => {
    const reply = await handle(new DomainError("Invalid device."));

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      error: "Bad Request",
      message: "Invalid device.",
    });
  });

  it("maps missing devices to 404", async () => {
    const reply = await handle(new DeviceNotFoundError("device-1"));

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({
      error: "Not Found",
      message: 'Device with id "device-1" was not found.',
    });
  });

  it("maps unexpected errors to a generic 500 response", async () => {
    const reply = await handle(new Error("database password must not leak"));

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  });
});
