export const getMeasurementByIdSchema = {
  tags: ["Measurements"],
  summary: "Busca uma medição por ID",
  params: {
    type: "object",
    required: ["id"],
    properties: { id: { type: "string", format: "uuid" } },
  },
} as const;
