export const getDeviceByIdSchema = {
  tags: ["Devices"],
  summary: "Busca um dispositivo por ID",
  params: {
    type: "object",
    required: ["id"],
    properties: { id: { type: "string", format: "uuid" } },
  },
} as const;
