import fastify, { FastifyInstance } from "fastify";
import { RootRoutes } from "./presentation/http/routes/root-routes.js";
import { HealthRoutes } from "./presentation/http/routes/health-routes.js";
import { RegisterDeviceUseCase } from "./application/use-cases/register-device/register-device-use-case.js";
import { DeviceController } from "./presentation/http/controllers/device-controller.js";
import { DeviceRoutes } from "./presentation/http/routes/device-routes.js";
import { ListDevicesUseCase } from "./application/use-cases/list-devices/list-devices-use-case.js";
import { GetDeviceByIdUseCase } from "./application/use-cases/get-device-by-id/get-device-by-id-use-case.js";
import { HttpErrorHandler } from "./presentation/http/errors/http-error-handler.js";
import { PrismaDeviceRepository } from "./infrastructure/database/prisma/repositories/prisma-device-repository.js";
import type { DeviceRepository } from "./domain/repositories/device-repository.js";
import { ApplicationLifecycle } from "./application/services/application-lifecycle.js";
import { PrismaDatabaseHealthCheck } from "./infrastructure/database/prisma/prisma-database-health-check.js";
import { HealthController } from "./presentation/http/controllers/health-controller.js";
import { db } from "../prisma/db.js";
import type { DatabaseHealthCheck } from "./application/ports/database-health-check.js";
import { PrismaMeasurementRepository } from "./infrastructure/database/prisma/repositories/prisma-measurement-repository.js";
import { RegisterMeasurementUseCase } from "./application/use-cases/register-measurement/register-measurement-use-case.js";
import { MeasurementRepository } from "./domain/repositories/measurement-repository.js";
import { MeasurementController } from "./presentation/http/controllers/measurement-controller.js";
import { MeasurementRoutes } from "./presentation/http/routes/measurement-routes.js";
import { GetMeasurementByIdUseCase } from "./application/use-cases/get-measurement-by-id/get-measurement-by-id-use-case.js";
import { ListMeasurementsByDeviceUseCase } from "./application/use-cases/list-measurements-by-device/list-measurements-by-device-use-case.js";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { errorResponseSchema } from "./presentation/http/schemas/error-response-schema.js";

export class App {
  private readonly server: FastifyInstance;
  private readonly lifecycle = new ApplicationLifecycle();
  private readonly prisma = db;
  private readonly databaseHealthCheck: DatabaseHealthCheck;
  private readonly documentationReady: Promise<void>;

  constructor(
    deviceRepository: DeviceRepository = new PrismaDeviceRepository(),
    databaseHealthCheck: DatabaseHealthCheck = new PrismaDatabaseHealthCheck(),
    measurementRepository: MeasurementRepository = new PrismaMeasurementRepository(),
  ) {
    this.databaseHealthCheck = databaseHealthCheck;
    this.server = fastify({
      logger: true,
    });
    this.server.setErrorHandler(HttpErrorHandler.handle);

    this.documentationReady = Promise.resolve(
      this.registerDocumentation(deviceRepository, measurementRepository),
    );
  }

  public getServer(): FastifyInstance {
    return this.server;
  }

  public getPrisma(): typeof db {
    return this.prisma;
  }

  public getLifecycle(): ApplicationLifecycle {
    return this.lifecycle;
  }

  public async initialize(): Promise<void> {
    await this.documentationReady;
    await this.server.ready();
    await this.databaseHealthCheck.ping();
  }

  private async registerDocumentation(
    deviceRepository: DeviceRepository,
    measurementRepository: MeasurementRepository,
  ): Promise<void> {
    await this.server.register(swagger, {
      openapi: {
        info: {
          title: "PulseGrid API",
          description: "API para gerenciamento de dispositivos e medições.",
          version: "1.0.0",
        },
        servers: [{ url: "http://localhost:3000", description: "Local" }],
        tags: [
          { name: "Health", description: "Estado e disponibilidade da API" },
          {
            name: "Devices",
            description: "Cadastro e consulta de dispositivos",
          },
          {
            name: "Measurements",
            description: "Registro e consulta de medições",
          },
        ],
        components: { schemas: { Error: errorResponseSchema } },
      },
    });
    this.registerRoutes(deviceRepository, measurementRepository);
    await this.server.register(swaggerUi, {
      routePrefix: "/docs",
      staticCSP: true,
      uiConfig: { docExpansion: "list", deepLinking: true },
    });
  }

  private registerRoutes(
    deviceRepository: DeviceRepository,
    measurementRepository: MeasurementRepository,
  ): void {
    const healthController = new HealthController(
      this.lifecycle,
      this.databaseHealthCheck,
    );
    const registerDeviceUseCase = new RegisterDeviceUseCase(deviceRepository);
    const listDevicesUseCase = new ListDevicesUseCase(deviceRepository);
    const getDeviceByIdUseCase = new GetDeviceByIdUseCase(deviceRepository);
    const deviceController = new DeviceController(
      registerDeviceUseCase,
      listDevicesUseCase,
      getDeviceByIdUseCase,
    );

    const registerMeasurementUseCase = new RegisterMeasurementUseCase(
      deviceRepository,
      measurementRepository,
    );
    const getMeasurementByIdUseCase = new GetMeasurementByIdUseCase(
      measurementRepository,
    );
    const listMeasurementsByDeviceUseCase = new ListMeasurementsByDeviceUseCase(
      deviceRepository,
      measurementRepository,
    );
    const measurementController = new MeasurementController(
      registerMeasurementUseCase,
      getMeasurementByIdUseCase,
      listMeasurementsByDeviceUseCase,
    );

    const rootRoutes = new RootRoutes(this.server);
    const healthRoutes = new HealthRoutes(this.server, healthController);
    const deviceRoutes = new DeviceRoutes(this.server, deviceController);
    const measurementRoutes = new MeasurementRoutes(
      this.server,
      measurementController,
    );

    rootRoutes.register();
    healthRoutes.register();
    deviceRoutes.register();
    measurementRoutes.register();
  }
}
