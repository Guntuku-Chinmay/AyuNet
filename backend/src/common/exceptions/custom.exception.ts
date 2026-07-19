import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, status);
  }
}

export class DatabaseException extends AppException {
  constructor(message: string = 'Database operation failed') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class ValidationException extends AppException {
  public readonly errors: string[];

  constructor(errors: string[], message: string = 'Validation failed') {
    super(message, HttpStatus.BAD_REQUEST);
    this.errors = errors;
  }
}

export class ResourceNotFoundException extends AppException {
  constructor(resource: string, identifier: string | number) {
    super(`${resource} with identifier '${identifier}' was not found`, HttpStatus.NOT_FOUND);
  }
}
