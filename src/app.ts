import fastify, { FastifyInstance } from "fastify";
import { RootRoutes } from "./presentation/http/routes/root-routes";
import { HealthRoutes } from "./presentation/http/routes/health-routes";
import { InMemoryDeviceRepository } from "./infrastructure/repositories/in-memory/in-memory-device-repository";
import { RegisterDeviceUseCase } from "./application/use-cases/register-device/register-device-use-case";
import { DeviceController } from "./presentation/http/controllers/device-controller";
import { DeviceRoutes } from "./presentation/http/routes/device-routes";
import { ListDevicesUseCase } from "./application/use-cases/list-devices/list-devices-use-case";
import { GetDeviceByIdUseCase } from "./application/use-cases/get-device-by-id/get-device-by-id-use-case";
import { HttpErrorHandler } from "./presentation/http/errors/http-error-handler";

export class App {
  private readonly server: FastifyInstance;

  constructor() {
    this.server = fastify({
      logger: true,
    });
    this.server.setErrorHandler(HttpErrorHandler.handle);

    this.registerRoutes();
  }

  public getServer(): FastifyInstance {
    return this.server;
  }

  private registerRoutes(): void {
    const deviceRepository = new InMemoryDeviceRepository();
    const registerDeviceUseCase = new RegisterDeviceUseCase(deviceRepository);
    const listDevicesUseCase = new ListDevicesUseCase(deviceRepository);
    const getDeviceByIdUseCase = new GetDeviceByIdUseCase(deviceRepository);
    const deviceController = new DeviceController(
      registerDeviceUseCase,
      listDevicesUseCase,
      getDeviceByIdUseCase,
    );

    const rootRoutes = new RootRoutes(this.server);
    const healthRoutes = new HealthRoutes(this.server);
    const deviceRoutes = new DeviceRoutes(this.server, deviceController);

    rootRoutes.register();
    healthRoutes.register();
    deviceRoutes.register();
  }
}
