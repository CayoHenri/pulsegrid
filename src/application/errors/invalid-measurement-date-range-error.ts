import { InvalidPaginationParameterError } from "../pagination/pagination-errors.js";

export class InvalidMeasurementDateRangeError extends InvalidPaginationParameterError {
  constructor() {
    super('The "from" date must be earlier than or equal to the "to" date.');
    this.name = "InvalidMeasurementDateRangeError";
  }
}
