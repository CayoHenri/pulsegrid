import { deviceResponseSchema } from "./device-response-schema.js";

export const listDevicesSchema = {
  tags: ["Devices"],
  summary: "Lista dispositivos",
  response: {
    200: { type: "array", items: deviceResponseSchema },
  },
} as const;
