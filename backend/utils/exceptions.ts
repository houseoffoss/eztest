export class BadRequestException extends Error {
  statusCode: number;
  data: unknown;

  constructor(message: string, data?: unknown) {
    super(message);
    this.name = 'BadRequestException';
    this.statusCode = 400;
    this.data = data;
  }
}

export class UnauthorizedException extends Error {
  statusCode: number;
  data: unknown;

  constructor(message: string, data?: unknown) {
    super(message);
    this.name = 'UnauthorizedException';
    this.statusCode = 401;
    this.data = data;
  }
}

export class ForbiddenException extends Error {
  statusCode: number;
  data: unknown;

  constructor(message: string, data?: unknown) {
    super(message);
    this.name = 'ForbiddenException';
    this.statusCode = 403;
    this.data = data;
  }
}

export class NotFoundException extends Error {
  statusCode: number;
  data: unknown;

  constructor(message: string, data?: unknown) {
    super(message);
    this.name = 'NotFoundException';
    this.statusCode = 404;
    this.data = data;
  }
}

export class ConflictException extends Error {
  statusCode: number;
  data: unknown;

  constructor(message: string, data?: unknown) {
    super(message);
    this.name = 'ConflictException';
    this.statusCode = 409;
    this.data = data;
  }
}

export class ValidationException extends Error {
  statusCode: number;
  data: unknown;

  constructor(message: string, data?: unknown) {
    super(message);
    this.name = 'ValidationException';
    this.statusCode = 422;
    this.data = data;
  }
}

export class InternalServerException extends Error {
  statusCode: number;
  data: unknown;

  constructor(message: string, data?: unknown) {
    super(message);
    this.name = 'InternalServerException';
    this.statusCode = 500;
    this.data = data;
  }
}
