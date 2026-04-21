import { Router, Request, Response } from 'express';
import OllamaService from '../services/ollamaService';
import logger from '../utils/logger';
import { validateQuery } from '../middleware/validate';
import { ollamaStatusQuerySchema } from '../schemas/chat.schema';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.get('/status', validateQuery(ollamaStatusQuerySchema), async (req: Request, res: Response) => {
  try {
    const ollamaUrl = (req.query.url as string) || 'http://localhost:11434';
    const ollamaService = new OllamaService(ollamaUrl);

    const connected = await ollamaService.checkConnection();
    const models = connected ? await ollamaService.listModels() : [];

    res.json({ connected, models });
  } catch (error) {
    logger.error({ error }, 'Ollama status error');
    throw new AppError('Failed to check Ollama status', 500, 'OLLAMA_STATUS_ERROR');
  }
});

export default router;
