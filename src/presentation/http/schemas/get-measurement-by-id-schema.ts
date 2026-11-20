import { errorResponseSchema } from "./error-response-schema.js";
import { measurementResponseSchema } from "./measurement-response-schema.js";

export const getMeasurementByIdSchema = {
  tags: ["Measurements"],
  summary: "Busca uma medição por ID",
  params: {
    type: "object",
    required: ["id"],
    properties: { id: { type: "string", format: "uuid" } },
  },
  response: {
    200: measurementResponseSchema,
    404: errorResponseSchema,
  },
} as const;
