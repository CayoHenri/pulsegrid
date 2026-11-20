export const deviceResponseSchema = {
  type: "object",
  required: ["id", "name", "type", "location", "status", "createdAt"],
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    type: {
      type: "string",
      enum: ["TEMPERATURE", "HUMIDITY", "PRESSURE", "MULTI_SENSOR"],
    },
    location: { type: "string" },
    status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
    createdAt: { type: "string", format: "date-time" },
  },
} as const;
