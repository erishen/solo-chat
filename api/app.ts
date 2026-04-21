/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import rateLimit from 'express-rate-limit'
import { errorHandler } from './middleware/errorHandler.js'
import { initSentry } from './utils/sentry.js'
import authRoutes from './routes/auth.js'
import chatRoutes from './routes/chat.js'
import ollamaRoutes from './routes/ollama.js'

// Initialize Sentry
initSentry()

// for esm mode
const __filename = fileURLToPath(import.meta.url)
// __dirname is kept for potential future use
void path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(cors(corsOptions))
app.use('/api/', limiter)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/ollama', ollamaRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (_req: Request, res: Response, _next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use(errorHandler)

/**
 * 404 handler
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
