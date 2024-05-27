import { Stats } from '../domain/stats'

export const getPercentageDiff = (n1: number, n2: number): number => {
  const max = Math.max(n1, n2)
  const min = Math.min(n1, n2)

  if (max === min) {
    return 0
  }

  return (Math.abs(max - min) / min) * 100
}

export const calculateStats = (
  stats: Stats | undefined,
  newData: number
): Stats => {
  if (stats === undefined) {
    stats = getDefaultStats()
  }
  const count = stats.count + 1
  const total = stats.total + newData
  const avg = total / count
  const variance =
    ((count - 1) * stats.variance + (newData - avg) * (newData - stats.avg)) /
    count
  const sd = Math.sqrt(variance)

  return {
    count,
    total,
    min: stats.min === 0 ? newData : Math.min(stats.min, newData),
    max: stats.max === 0 ? newData : Math.max(stats.max, newData),
    avg,
    variance,
    sd,
    score: sd === 0 ? 0 : (newData - avg) / sd,
  }
}

export const getDefaultStats = (): Stats => {
  return {
    count: 0,
    total: 0,
    min: 0,
    max: 0,
    avg: 0,
    sd: 0,
    variance: 0,
    score: 0,
  }
}
