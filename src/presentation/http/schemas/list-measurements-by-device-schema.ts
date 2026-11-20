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
  querystring: {
    type: "object",
    additionalProperties: false,
    properties: {
      limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
      from: { type: "string", format: "date-time" },
      to: { type: "string", format: "date-time" },
      cursor: { type: "string", minLength: 1 },
    },
  },
  response: {
    200: {
      type: "object",
      required: ["items", "nextCursor", "hasMore"],
      properties: {
        items: { type: "array", items: measurementResponseSchema },
        nextCursor: { anyOf: [{ type: "string" }, { type: "null" }] },
        hasMore: { type: "boolean" },
      },
    },
    400: errorResponseSchema,
    404: errorResponseSchema,
  },
} as const;
