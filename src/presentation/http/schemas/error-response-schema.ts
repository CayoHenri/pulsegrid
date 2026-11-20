export const errorResponseSchema = {
  type: "object",
  required: ["error", "message"],
  properties: {
    error: { type: "string" },
    message: { type: "string" },
  },
} as const satisfies import("openapi-types").OpenAPIV3.SchemaObject;
