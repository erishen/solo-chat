import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  errorHandler, 
  AppError, 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError, 
  ForbiddenError 
} from '../middleware/errorHandler'
import { Request, Response, NextFunction } from 'express'

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      url: '/test',
      headers: {},
      body: {},
      query: {},
    }
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
    mockNext = vi.fn() as unknown as NextFunction
  })

  describe('AppError', () => {
    it('should create an AppError with default values', () => {
      const error = new AppError('Test error')
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('INTERNAL_ERROR')
    })

    it('should create an AppError with custom values', () => {
      const error = new AppError('Custom error', 400, 'CUSTOM_ERROR')
      expect(error.message).toBe('Custom error')
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('CUSTOM_ERROR')
    })
  })

  describe('ValidationError', () => {
    it('should create a ValidationError', () => {
      const details = { field: 'name', message: 'Required' }
      const error = new ValidationError('Validation failed', details)
      expect(error.message).toBe('Validation failed')
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.details).toEqual(details)
    })
  })

  describe('NotFoundError', () => {
    it('should create a NotFoundError with default message', () => {
      const error = new NotFoundError()
      expect(error.message).toBe('Resource not found')
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
    })

    it('should create a NotFoundError with custom message', () => {
      const error = new NotFoundError('User not found')
      expect(error.message).toBe('User not found')
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
    })
  })

  describe('UnauthorizedError', () => {
    it('should create an UnauthorizedError with default message', () => {
      const error = new UnauthorizedError()
      expect(error.message).toBe('Unauthorized')
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('UNAUTHORIZED')
    })

    it('should create an UnauthorizedError with custom message', () => {
      const error = new UnauthorizedError('Invalid token')
      expect(error.message).toBe('Invalid token')
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('UNAUTHORIZED')
    })
  })

  describe('ForbiddenError', () => {
    it('should create a ForbiddenError with default message', () => {
      const error = new ForbiddenError()
      expect(error.message).toBe('Forbidden')
      expect(error.statusCode).toBe(403)
      expect(error.code).toBe('FORBIDDEN')
    })

    it('should create a ForbiddenError with custom message', () => {
      const error = new ForbiddenError('Access denied')
      expect(error.message).toBe('Access denied')
      expect(error.statusCode).toBe(403)
      expect(error.code).toBe('FORBIDDEN')
    })
  })

  describe('errorHandler', () => {
    it('should handle AppError correctly', () => {
      const error = new AppError('Test error', 400, 'TEST_ERROR')
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Test error',
        code: 'TEST_ERROR',
      })
    })

    it('should handle ValidationError with details', () => {
      const details = { field: 'email', message: 'Invalid email' }
      const error = new ValidationError('Validation failed', details)
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: details,
      })
    })

    it('should handle NotFoundError', () => {
      const error = new NotFoundError('User not found')
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found',
        code: 'NOT_FOUND',
      })
    })

    it('should handle UnauthorizedError', () => {
      const error = new UnauthorizedError('Invalid credentials')
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid credentials',
        code: 'UNAUTHORIZED',
      })
    })

    it('should handle ForbiddenError', () => {
      const error = new ForbiddenError('Access denied')
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied',
        code: 'FORBIDDEN',
      })
    })

    it('should handle generic Error with 500 status', () => {
      const error = new Error('Something went wrong')
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      })
    })

    it('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const error = new Error('Test error')
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String),
        })
      )

      process.env.NODE_ENV = originalEnv
    })
  })
})
