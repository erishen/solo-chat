import { z } from 'zod'

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  images: z.array(z.string()).optional(),
})

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, 'At least one message is required'),
  model: z.string().min(1, 'Model is required'),
  options: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      top_p: z.number().min(0).max(1).optional(),
      max_tokens: z.number().positive().optional(),
    })
    .optional(),
  ollamaUrl: z.string().url().optional(),
})

export const ollamaStatusQuerySchema = z.object({
  url: z.string().url().optional(),
})

export type ChatRequest = z.infer<typeof chatRequestSchema>
export type ChatMessage = z.infer<typeof chatMessageSchema>
export type OllamaStatusQuery = z.infer<typeof ollamaStatusQuerySchema>
