import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'

interface CustomError extends Error {
  statusCode?: number
  code?: string
  details?: unknown
}

export class AppError extends Error {
  statusCode: number
  code: string
  details?: unknown

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR')
    this.details = details
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
  }
}

export const errorHandler = (err: CustomError, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Log error details
  logger.error({
    error: {
      message: err.message,
      code: err.code || 'UNKNOWN_ERROR',
      statusCode,
      stack: isDevelopment ? err.stack : undefined,
      details: err.details,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query,
    },
  }, 'Error occurred')

  // Send response
  const response: {
    success: false
    error: string
    code?: string
    details?: unknown
    stack?: string
  } = {
    success: false,
    error: statusCode === 500 && !isDevelopment 
      ? 'Internal server error' 
      : err.message,
    code: err.code || 'INTERNAL_ERROR',
  }

  // Include details in development or for validation errors
  if (err.details && (isDevelopment || statusCode === 400)) {
    response.details = err.details
  }

  // Include stack trace in development
  if (isDevelopment && err.stack) {
    response.stack = err.stack
  }

  res.status(statusCode).json(response)
}

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
