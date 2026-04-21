import { describe, it, expect, vi, beforeEach } from 'vitest'
import OllamaService from '../services/ollamaService'

// Mock fetch globally
global.fetch = vi.fn()

describe('OllamaService', () => {
  let service: OllamaService
  const baseUrl = 'http://localhost:11434'

  beforeEach(() => {
    service = new OllamaService(baseUrl)
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create instance with default base URL', () => {
      const defaultService = new OllamaService()
      expect(defaultService).toBeDefined()
    })

    it('should create instance with custom base URL', () => {
      const customService = new OllamaService('http://custom:11434')
      expect(customService).toBeDefined()
    })
  })

  describe('checkConnection', () => {
    it('should return true when connection is successful', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
      } as Response)

      const result = await service.checkConnection()
      expect(result).toBe(true)
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/api/tags`)
    })

    it('should return false when connection fails', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Connection failed'))

      const result = await service.checkConnection()
      expect(result).toBe(false)
    })

    it('should return false when response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
      } as Response)

      const result = await service.checkConnection()
      expect(result).toBe(false)
    })
  })

  describe('listModels', () => {
    it('should return list of models', async () => {
      const mockModels = {
        models: [
          { name: 'gemma4:latest', modified_at: '2024-01-01', size: 1000000 },
          { name: 'llama2:latest', modified_at: '2024-01-02', size: 2000000 },
        ],
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockModels,
      } as Response)

      const result = await service.listModels()
      expect(result).toEqual(['gemma4:latest', 'llama2:latest'])
    })

    it('should return empty array on error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Failed to fetch'))

      const result = await service.listModels()
      expect(result).toEqual([])
    })
  })

  describe('chatStream', () => {
    it('should stream chat responses', async () => {
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(JSON.stringify({
                  model: 'gemma4',
                  created_at: '2024-01-01',
                  message: { role: 'assistant', content: 'Hello' },
                  done: false,
                }) + '\n'),
              })
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(JSON.stringify({
                  model: 'gemma4',
                  created_at: '2024-01-01',
                  message: { role: 'assistant', content: ' world' },
                  done: false,
                }) + '\n'),
              })
              .mockResolvedValueOnce({ done: true }),
            releaseLock: vi.fn(),
          }),
        },
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      const request = {
        model: 'gemma4:latest',
        messages: [{ role: 'user' as const, content: 'Hi' }],
      }

      const chunks: string[] = []
      for await (const chunk of service.chatStream(request)) {
        chunks.push(chunk)
      }

      expect(chunks).toEqual(['Hello', ' world'])
    })

    it('should throw error when response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response)

      const request = {
        model: 'gemma4:latest',
        messages: [{ role: 'user' as const, content: 'Hi' }],
      }

      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _chunk of service.chatStream(request)) {
          // Should not reach here
        }
      }).rejects.toThrow('Ollama API error: 500')
    })

    it('should throw error when no response body', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        body: null,
      } as unknown as Response)

      const request = {
        model: 'gemma4:latest',
        messages: [{ role: 'user' as const, content: 'Hi' }],
      }

      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _chunk of service.chatStream(request)) {
          // Should not reach here
        }
      }).rejects.toThrow('No response body')
    })

    it('should handle malformed JSON in stream', async () => {
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode('invalid json\n'),
              })
              .mockResolvedValueOnce({ done: true }),
            releaseLock: vi.fn(),
          }),
        },
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      const request = {
        model: 'gemma4:latest',
        messages: [{ role: 'user' as const, content: 'Hi' }],
      }

      const chunks: string[] = []
      for await (const chunk of service.chatStream(request)) {
        chunks.push(chunk)
      }

      // Should not throw, just skip malformed JSON
      expect(chunks).toEqual([])
    })
  })
})
