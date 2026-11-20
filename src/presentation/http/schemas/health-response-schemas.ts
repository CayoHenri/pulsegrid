export const healthResponseSchemas = {
  healthy: {
    type: "object",
    required: ["status"],
    properties: { status: { type: "string", enum: ["ok"] } },
  },
  alive: {
    type: "object",
    required: ["status"],
    properties: { status: { type: "string", enum: ["alive"] } },
  },
  ready: {
    type: "object",
    required: ["status"],
    properties: { status: { type: "string", enum: ["ready"] } },
  },
  notReady: {
    type: "object",
    required: ["status"],
    properties: { status: { type: "string", enum: ["not_ready"] } },
  },
} as const;
