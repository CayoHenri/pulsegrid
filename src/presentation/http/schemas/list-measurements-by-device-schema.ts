import { errorResponseSchema } from "./error-response-schema.js";
import { measurementResponseSchema } from "./measurement-response-schema.js";

export const listMeasurementsByDeviceSchema = {
  tags: ["Measurements"],
  summary: "Lista medições de um dispositivo",
  params: {
    type: "object",
    required: ["deviceId"],
    properties: { deviceId: { type: "string", format: "uuid" } },
  },
  response: {
    200: { type: "array", items: measurementResponseSchema },
    404: errorResponseSchema,
  },
} as const;
