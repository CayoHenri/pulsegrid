export const registerMeasurementSchema = {
  tags: ["Measurements"],
  summary: "Registra uma medição",
  description:
    "Associa uma leitura numérica e seu instante de coleta a um dispositivo existente.",
  body: {
    type: "object",
    required: ["deviceId", "value", "recordedAt"],
    additionalProperties: false,
    properties: {
      deviceId: {
        type: "string",
        pattern:
          "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
      },
      value: {
        type: "number",
      },
      recordedAt: {
        type: "string",
        format: "date-time",
      },
    },
  },
  response: {
    201: {
      type: "object",
      required: ["id", "deviceId", "value", "recordedAt", "createdAt"],
      properties: {
        id: { type: "string", format: "uuid" },
        deviceId: { type: "string", format: "uuid" },
        value: { type: "number" },
        recordedAt: { type: "string", format: "date-time" },
        createdAt: { type: "string", format: "date-time" },
      },
    },
  },
} as const;
