import { FastifyReply, FastifyRequest } from "fastify";
import { DatabaseHealthCheck } from "../../../application/ports/database-health-check";
import { ApplicationLifecycle } from "../../../application/services/application-lifecycle";

export class HealthController {
  constructor(
    private readonly applicationLifecycle: ApplicationLifecycle,
    private readonly databaseHealthCheck: DatabaseHealthCheck,
  ) {}

  public async health(_: FastifyRequest, reply: FastifyReply): Promise<void> {
    await reply.status(200).send({
      status: "ok",
    });
  }

  public async live(_: FastifyRequest, reply: FastifyReply): Promise<void> {
    await reply.status(200).send({
      status: "alive",
    });
  }

  public async ready(_: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (this.applicationLifecycle.isShuttingDown()) {
      await reply.status(503).send({
        status: "not_ready",
      });
      return;
    }

    try {
      await this.databaseHealthCheck.ping();
      await reply.status(200).send({
        status: "ready",
      });
    } catch (error) {
      console.error("Database health check failed:", error);
      await reply.status(503).send({
        status: "not_ready",
      });
    }
  }
}
