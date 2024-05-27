import { rules } from './rules'
import { calculateStats, getPercentageDiff } from './utils'
import { CalculatedData } from '../domain/calculated-data'
import { Candle } from '../domain/candle'
import { getOneLastBySymbol, storeData } from '../infrastructure/calculated-data-repository'

export const candles = async (data: Candle): Promise<void> => {
  const lastResult = await getOneLastBySymbol(data.symbol, {})
  const allOi = data.openInterest.concat(lastResult.openInterest || [])
  const maxOI = Math.max(...allOi)
  const minOI = Math.min(...allOi)
  const oiDiff = getPercentageDiff(maxOI, minOI)
  const priceDiffOC = getPercentageDiff(data.open, data.close)
  const priceDiffHL = getPercentageDiff(data.high, data.low)

  const result: CalculatedData = {
    ...data,
    priceDiffHL,
    priceDiffOC,
    oiDiff,
    volumeStats: calculateStats(lastResult.volumeStats, data.volume),
    tickStats: calculateStats(lastResult.tickStats, data.tick),
    priceDiffHLStats: calculateStats(lastResult.priceDiffHLStats, priceDiffHL),
    priceDiffOCStats: calculateStats(lastResult.priceDiffOCStats, priceDiffOC),
    oiDiffStats: calculateStats(lastResult.oiDiffStats, oiDiff),
  }

  await storeData(result.symbol, result)
  await rules(result)
}
