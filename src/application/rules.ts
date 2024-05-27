import LRU_TTL from 'lru-ttl-cache'
import { getListByPeriod } from './get-list-by-period'
import { newsBySymbol } from './news'
import { CalculatedData } from '../domain/calculated-data'
import { getAlertsByPairAndTime, storeData } from '../infrastructure/alerts-repository'
import { sendCandles, sendOi } from '../infrastructure/notifications'
const cache = new LRU_TTL({ ttl: '15m', ttlInterval: '60s' })

const CANDLE_SCORE = 30
const LIQUIDATIONS = 4
const OI_SCORE = 5

export const rules = async (data: CalculatedData): Promise<void> => {
  await candlesRules(data)
  await oiRules(data)
}

const candlesRules = async (data: CalculatedData) => {
  const volumeScore = Math.abs(data.volumeStats.score)
  const tickScore = Math.abs(data.tickStats.score)
  if (
    volumeScore > CANDLE_SCORE &&
    tickScore > CANDLE_SCORE &&
    data.liquidations.qty > LIQUIDATIONS
  ) {
    await sendCandles(data)
  }
}

const oiRules = async (data: CalculatedData) => {
  const list = await getCachedList()
  if (list.includes(data.symbol)) {
    return
  }
  const previousAlert = await getAlertsByPairAndTime(
    data.symbol,
    new Date().getTime() - 12 * 60 * 60 * 1000
  )

  if (previousAlert.length > 0) {
    return
  }
  const volumeScore = Math.abs(data.volumeStats.score)
  const tickScore = Math.abs(data.tickStats.score)
  const priceDiffHl = Math.abs(data.priceDiffHLStats.score)
  const oiDiffScore = Math.abs(data.oiDiffStats.score)

  if (
    volumeScore >= OI_SCORE &&
    tickScore >= OI_SCORE &&
    priceDiffHl >= OI_SCORE &&
    oiDiffScore >= OI_SCORE
  ) {
    const news = await newsBySymbol(data.symbol)
    await sendOi({ ...data, news })
    await storeData('cache_alerts', data)
  }
}

const getCachedList = async (): Promise<Array<string>> => {
  if (cache.has('list_oi_4h')) {
    return <Array<string>>cache.get('list_oi_4h')
  }

  const list = await getListByPeriod('4h', 50)
  const result = []

  for (const item of list) {
    result.push(item)
  }

  cache.set('list_oi_4h', result)

  return result
}
