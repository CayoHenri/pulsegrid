import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { DomainError } from "../../../domain/errors/domain-error";
import { DeviceNotFoundError } from "../../../application/errors/device-not-found-error";

export class HttpErrorHandler {
  public static async handle(
    error: FastifyError,
    _request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    
    if (error.validation) {
      await reply.status(400).send({
        error: "Bad Request",
        message: "Invalid request data.",
        details: error.validation,
      });

      return;
    }
    if (error instanceof DomainError) {
      await reply.status(400).send({
        error: "Bad Request",
        message: error.message,
      });

      return;
    }

    if (error instanceof DeviceNotFoundError) {
      await reply.status(404).send({
        error: "Not Found",
        message: error.message,
      });

      return;
    }

    await reply.status(500).send({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}
