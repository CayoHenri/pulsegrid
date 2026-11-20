export const registerDeviceSchema = {
  tags: ["Devices"],
  summary: "Cadastra um dispositivo",
  description: "Cria um dispositivo ativo para receber medições.",
  body: {
    type: "object",
    required: ["name", "type", "location"],
    additionalProperties: false,
    properties: {
      name: {
        type: "string",
        minLength: 1,
      },
      type: {
        type: "string",
        enum: ["TEMPERATURE", "HUMIDITY", "PRESSURE", "MULTI_SENSOR"],
      },
      location: {
        type: "string",
        minLength: 1,
      },
    },
  },
  response: {
    201: {
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
    },
  },
} as const;
