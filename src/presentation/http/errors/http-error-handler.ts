import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { DomainError } from "../../../domain/errors/domain-error";
import { DeviceNotFoundError } from "../../../application/errors/device-not-found-error";

export class HttpErrorHandler {
  public static async handle(
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    if (error.validation) {
      request.log.info({ err: error }, "Request validation failed");
      await reply.status(400).send({
        error: "Bad Request",
        message: "Invalid request data.",
        details: error.validation,
      });

      return;
    }
    if (error instanceof DomainError) {
      request.log.info({ err: error }, "Domain rule rejected request");
      await reply.status(400).send({
        error: "Bad Request",
        message: error.message,
      });

      return;
    }

    if (error instanceof DeviceNotFoundError) {
      request.log.info({ err: error }, "Device was not found");
      await reply.status(404).send({
        error: "Not Found",
        message: error.message,
      });

      return;
    }

    request.log.error({ err: error }, "Unhandled request error");
    await reply.status(500).send({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}
