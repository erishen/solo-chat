import { describe, it, expect, beforeEach, vi } from 'vitest'
import { validateBody, validateQuery } from '../middleware/validate'
import { chatRequestSchema, ollamaStatusQuerySchema } from '../schemas/chat.schema'
import { Request, Response, NextFunction } from 'express'

describe('Validation Middleware', () => {
  const mockResponse = () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
    return res as unknown as Response
  }

  let mockNext: NextFunction

  beforeEach(() => {
    mockNext = vi.fn() as unknown as NextFunction
  })

  describe('validateBody', () => {
    it('should pass valid chat request', () => {
      const validBody = {
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        model: 'gemma4:latest',
        options: {
          temperature: 0.7
        }
      }

      const req = { body: validBody } as Request
      const res = mockResponse()
      const middleware = validateBody(chatRequestSchema)

      middleware(req, res, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(req.body).toEqual(validBody)
    })

    it('should reject invalid chat request', () => {
      const invalidBody = {
        messages: [],
        model: ''
      }

      const req = { body: invalidBody } as Request
      const res = mockResponse()
      const middleware = validateBody(chatRequestSchema)

      middleware(req, res, mockNext)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Validation error'
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject request with invalid temperature', () => {
      const invalidBody = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gemma4:latest',
        options: {
          temperature: 3.0 // Invalid: > 2
        }
      }

      const req = { body: invalidBody } as Request
      const res = mockResponse()
      const middleware = validateBody(chatRequestSchema)

      middleware(req, res, mockNext)

      expect(res.status).toHaveBeenCalledWith(400)
    })
  })

  describe('validateQuery', () => {
    it('should pass valid query params', () => {
      const validQuery = {
        url: 'http://localhost:11434'
      }

      const req = { query: validQuery } as unknown as Request
      const res = mockResponse()
      const middleware = validateQuery(ollamaStatusQuerySchema)

      middleware(req, res, mockNext)

      expect(mockNext).toHaveBeenCalled()
    })

    it('should reject invalid URL', () => {
      const invalidQuery = {
        url: 'not-a-url'
      }

      const req = { query: invalidQuery } as unknown as Request
      const res = mockResponse()
      const middleware = validateQuery(ollamaStatusQuerySchema)

      middleware(req, res, mockNext)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should allow empty query', () => {
      const req = { query: {} } as unknown as Request
      const res = mockResponse()
      const middleware = validateQuery(ollamaStatusQuerySchema)

      middleware(req, res, mockNext)

      expect(mockNext).toHaveBeenCalled()
    })
  })
})
