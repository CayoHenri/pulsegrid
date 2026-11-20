export const rootResponseSchema = {
  type: "object",
  required: ["name", "status"],
  properties: {
    name: { type: "string", enum: ["PulseGrid API"] },
    status: { type: "string", enum: ["running"] },
  },
} as const;
