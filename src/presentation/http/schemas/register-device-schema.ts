export const registerDeviceSchema = {
  body: {
    type: "object",
    required: ["name", "type", "location"],
    additionalProperties: false,
    properties: {
      name: {
        type: "string",
        minLength: 1,
      },
      type: {
        type: "string",
        enum: ["TEMPERATURE", "HUMIDITY", "PRESSURE", "MULTI_SENSOR"],
      },
      location: {
        type: "string",
        minLength: 1,
      },
    },
  },
} as const;
