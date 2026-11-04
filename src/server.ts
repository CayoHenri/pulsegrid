import { App } from "./app.js";

const application = new App();

const server = application.getServer();
const prisma = application.getPrisma();
const lifecycle = application.getLifecycle();

const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";

let serverListening = false;
let shutdownPromise: Promise<void> | undefined;

function shutdown(signal: string): Promise<void> {
  if (shutdownPromise) return shutdownPromise;

  lifecycle.beginShutdown();
  server.log.info({ signal }, "Shutting down application");

  shutdownPromise = (async () => {
    let shutdownFailed = false;

    if (serverListening) {
      try {
        await server.close();
        serverListening = false;
      } catch (error) {
        shutdownFailed = true;
        server.log.error(error, "Error while closing HTTP server");
      }
    }

    try {
      await prisma.close();
    } catch (error) {
      shutdownFailed = true;
      server.log.error(error, "Error while closing Prisma client");
    }

    if (shutdownFailed) {
      process.exitCode = 1;
      return;
    }

    server.log.info("Application stopped gracefully");
    process.exitCode = 0;
  })();

  return shutdownPromise;
}

process.once("SIGTERM", () => void shutdown("SIGTERM"));

process.once("SIGINT", () => void shutdown("SIGINT"));

async function start(): Promise<void> {
  try {
    await application.initialize();

    if (lifecycle.isShuttingDown()) return;

    await server.listen({
      port,
      host,
    });
    serverListening = true;

    if (lifecycle.isShuttingDown()) {
      try {
        await server.close();
        serverListening = false;
      } catch (error) {
        server.log.error(
          error,
          "Error while closing HTTP server after startup",
        );
        process.exitCode = 1;
      }
    }
  } catch (error) {
    if (lifecycle.isShuttingDown()) return;

    server.log.error(error, "Application startup failed");
    await shutdown("startup failure");
    process.exitCode = 1;
  }
}

void start();
