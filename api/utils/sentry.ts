import * as Sentry from '@sentry/node'

export function initSentry() {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        Sentry.httpIntegration(),
        Sentry.expressIntegration(),
      ],
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
      release: process.env.npm_package_version || '1.0.0',
    })
  }
}

export function captureException(error: Error) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error)
  }
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, level)
  }
}

export { Sentry }
