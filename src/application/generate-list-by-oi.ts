import { storeData } from '../infrastructure/calculated-data-repository'
import { getOpenInterestByTime } from '../infrastructure/exchange'

export const generateListByOi = async (period: string): Promise<void> => {
  const list: Record<string, any> = await getOpenInterestByTime(period)
  return storeData('symbol_list', {
    list,
    period,
    timestamp: new Date().getTime(),
  })
}
