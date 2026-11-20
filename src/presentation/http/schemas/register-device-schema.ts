import { deviceResponseSchema } from "./device-response-schema.js";
import { errorResponseSchema } from "./error-response-schema.js";

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
    201: deviceResponseSchema,
    400: errorResponseSchema,
  },
} as const;
