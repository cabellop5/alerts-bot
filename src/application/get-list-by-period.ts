import { getPercentageDiff } from './utils'
import { getOneSymbolList } from '../infrastructure/symbol-repository'

export const getListByPeriod = async (
  period: string,
  limit: number | undefined
): Promise<Array<Record<string, any>>> => {
  const item = await getOneSymbolList(period)

  if (item === undefined) {
    return []
  }

  let data = []

  for (const symbol in item.list) {
    const element = item.list[symbol]

    if (element === undefined || element.length < 2) {
      data.push({
        index: symbol,
        diff: 0,
      })
      continue
    }

    const diff = getPercentageDiff(
      element[0].sumOpenInterest || 0,
      element[1].sumOpenInterest || 0
    )
    data.push({
      symbol,
      diff,
    })
  }

  data.sort((a, b) => parseFloat(b['diff']) - parseFloat(a['diff']))

  if (limit !== undefined) {
    data = data.slice(0, limit)
  }

  return data
}
