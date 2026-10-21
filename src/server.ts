import { App } from "./app";

const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";

const application = new App();
const server = application.getServer();

const start = async (): Promise<void> => {
  try {
    await server.listen({
      port,
      host,
    });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

void start();
