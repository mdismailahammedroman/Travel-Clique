class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  StatusCodes: number | undefined;

  constructor(statusCode: number, message: string, stack?: string) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true;

    if (stack !== undefined) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
