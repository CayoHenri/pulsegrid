import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/app";
import type { DatabaseHealthCheck } from "../src/application/ports/database-health-check";
import { InMemoryDeviceRepository } from "../src/infrastructure/repositories/in-memory/in-memory-device-repository";

describe("Health endpoints", () => {
  const apps: App[] = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.getServer().close()));
    vi.restoreAllMocks();
  });

  const createApp = (ping = vi.fn<DatabaseHealthCheck["ping"]>()): App => {
    const databaseHealthCheck: DatabaseHealthCheck = { ping };
    const app = new App(new InMemoryDeviceRepository(), databaseHealthCheck);
    apps.push(app);
    return app;
  };

  it("returns healthy status from GET /health", async () => {
    const app = createApp();
    const response = await app
      .getServer()
      .inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });

  it("returns alive status from GET /live", async () => {
    const app = createApp();
    const response = await app
      .getServer()
      .inject({ method: "GET", url: "/live" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "alive" });
  });

  it("returns ready when the database responds to ping", async () => {
    const ping = vi
      .fn<DatabaseHealthCheck["ping"]>()
      .mockResolvedValue(undefined);
    const app = createApp(ping);
    const response = await app
      .getServer()
      .inject({ method: "GET", url: "/ready" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ready" });
    expect(ping).toHaveBeenCalledOnce();
  });

  it("returns not ready when the database ping fails", async () => {
    const ping = vi
      .fn<DatabaseHealthCheck["ping"]>()
      .mockRejectedValue(new Error("Database unavailable"));
    const app = createApp(ping);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await app
      .getServer()
      .inject({ method: "GET", url: "/ready" });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({ status: "not_ready" });
    expect(ping).toHaveBeenCalledOnce();
  });

  it("returns not ready without pinging the database during shutdown", async () => {
    const ping = vi.fn<DatabaseHealthCheck["ping"]>();
    const app = createApp(ping);
    app.getLifecycle().beginShutdown();

    const response = await app
      .getServer()
      .inject({ method: "GET", url: "/ready" });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({ status: "not_ready" });
    expect(ping).not.toHaveBeenCalled();
  });
});
