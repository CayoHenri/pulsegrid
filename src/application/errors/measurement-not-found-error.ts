export class MeasurementNotFoundError extends Error {
  constructor(id: string) {
    super(`Measurement with id "${id}" was not found.`);
    this.name = "MeasurementNotFoundError";
  }
}
