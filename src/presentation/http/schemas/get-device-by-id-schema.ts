import { deviceResponseSchema } from "./device-response-schema.js";
import { errorResponseSchema } from "./error-response-schema.js";

export const getDeviceByIdSchema = {
  tags: ["Devices"],
  summary: "Busca um dispositivo por ID",
  params: {
    type: "object",
    required: ["id"],
    properties: { id: { type: "string", format: "uuid" } },
  },
  response: {
    200: deviceResponseSchema,
    404: errorResponseSchema,
  },
} as const;
