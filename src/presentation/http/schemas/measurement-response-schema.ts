export const measurementResponseSchema = {
  type: "object",
  required: ["id", "deviceId", "value", "recordedAt", "createdAt"],
  properties: {
    id: { type: "string", format: "uuid" },
    deviceId: { type: "string", format: "uuid" },
    value: { type: "number" },
    recordedAt: { type: "string", format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
  },
} as const;
