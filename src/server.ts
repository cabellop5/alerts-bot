/* eslint-disable import/order */
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env' })

import * as Sentry from '@sentry/node'
import { ProfilingIntegration } from '@sentry/profiling-node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new ProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
})

import { candles } from './application/candles'
import { history } from './application/history'
import { cron, initialJobs } from './infrastructure/cron'
import { dataSubscription } from './infrastructure/exchange'
import { routes } from './infrastructure/routes'
import { Candle } from "./domain/candle";

/* eslint-enable import/order */
const callbacks: Record<string, Array<(data: Candle) => void>> = {
  '1m': [candles, history],
  '5m': [history],
  '15m': [history],
}
routes()
dataSubscription(callbacks)
cron()
initialJobs()

console.log('Application started')
