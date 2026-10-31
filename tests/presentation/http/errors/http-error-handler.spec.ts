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
    const request = {
      log: {
        info: vi.fn(),
        error: vi.fn(),
      },
    };
    await HttpErrorHandler.handle(
      error as FastifyError,
      request as unknown as FastifyRequest,
      reply as unknown as FastifyReply,
    );
    return { reply, request };
  };

  it("maps domain errors to 400", async () => {
    const { reply, request } = await handle(new DomainError("Invalid device."));

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      error: "Bad Request",
      message: "Invalid device.",
    });
    expect(request.log.info).toHaveBeenCalledWith(
      { err: expect.any(DomainError) },
      "Domain rule rejected request",
    );
  });

  it("maps missing devices to 404", async () => {
    const { reply, request } = await handle(
      new DeviceNotFoundError("device-1"),
    );

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({
      error: "Not Found",
      message: 'Device with id "device-1" was not found.',
    });
    expect(request.log.info).toHaveBeenCalledWith(
      { err: expect.any(DeviceNotFoundError) },
      "Device was not found",
    );
  });

  it("maps unexpected errors to a generic 500 response", async () => {
    const error = new Error("database password must not leak");
    const { reply, request } = await handle(error);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
    expect(request.log.error).toHaveBeenCalledWith(
      { err: error },
      "Unhandled request error",
    );
    expect(request.log.info).not.toHaveBeenCalled();
  });

  it("logs validation errors and returns their details as a bad request", async () => {
    const validation = [
      {
        instancePath: "/name",
        message: "must be string",
        keyword: "type",
        schemaPath: "#/properties/name/type",
        params: { type: "string" },
      },
    ];
    const error = Object.assign(new Error("validation failed"), { validation });
    const { reply, request } = await handle(error);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      error: "Bad Request",
      message: "Invalid request data.",
      details: validation,
    });
    expect(request.log.info).toHaveBeenCalledWith(
      { err: error },
      "Request validation failed",
    );
  });
});
