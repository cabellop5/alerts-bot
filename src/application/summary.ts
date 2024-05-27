import { getListByPeriod } from './get-list-by-period'
import { Summary } from '../domain/summary'
import { getCandle } from '../infrastructure/exchange'
import { sendSummary } from '../infrastructure/notifications'

export const summary = async (): Promise<void> => {
  const data = await getListByPeriod('1h', 15)
  const result: Array<Summary> = []

  for (const element of data) {
    const candle = await getCandle(element.symbol, '1h', 2)
    if (candle === undefined) {
      continue
    }
    result.push({
      symbol: element.symbol,
      volume: parseFloat(parseFloat(candle.volume).toFixed(2)),
      ticks: candle.tick,
      oi: parseFloat(parseFloat(element.diff).toFixed(2)),
    })
  }

  return sendSummary(result.slice(0, 10))
}
