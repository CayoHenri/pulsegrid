import { App } from "./app";
import { db } from "../prisma/db";

const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";

const application = new App();
const server = application.getServer();

server.addHook("onClose", async () => await db.close());

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
