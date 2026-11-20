import { errorResponseSchema } from "./error-response-schema.js";
import { measurementResponseSchema } from "./measurement-response-schema.js";

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
    201: measurementResponseSchema,
    400: errorResponseSchema,
    404: errorResponseSchema,
  },
} as const;
