import { Router, Request, Response } from 'express';
import OllamaService from '../services/ollamaService';
import logger from '../utils/logger';
import { validateBody } from '../middleware/validate';
import { chatRequestSchema } from '../schemas/chat.schema';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.post('/', validateBody(chatRequestSchema), async (req: Request, res: Response) => {
  try {
    const { messages, model, options, ollamaUrl } = req.body;

    const ollamaService = new OllamaService(ollamaUrl || 'http://localhost:11434');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = ollamaService.chatStream({
      model,
      messages,
      options,
    });

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    logger.error({ error }, 'Chat error');
    throw new AppError('Failed to chat with Ollama', 500, 'OLLAMA_ERROR');
  }
});

export default router;
