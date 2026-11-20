export const listMeasurementsByDeviceSchema = {
  tags: ["Measurements"],
  summary: "Lista medições de um dispositivo",
  params: {
    type: "object",
    required: ["deviceId"],
    properties: { deviceId: { type: "string", format: "uuid" } },
  },
} as const;
