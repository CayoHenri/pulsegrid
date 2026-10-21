export class DeviceNotFoundError extends Error {
  constructor(id: string) {
    super(`Device with id "${id}" was not found.`);
    this.name = "DeviceNotFoundError";
  }
}
