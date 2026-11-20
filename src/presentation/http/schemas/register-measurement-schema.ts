export const registerMeasurementSchema = {
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
} as const;
