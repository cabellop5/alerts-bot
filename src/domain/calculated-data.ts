import { Liquidation } from './liquidations'
import { News } from './news'
import { Stats } from './stats'
import {Timeframe} from "./timeframe";

export type CalculatedData = {
  volume: number
  tick: number
  timestamp: number
  timeframe: Timeframe
  symbol: string
  open: number
  close: number
  high: number
  low: number
  liquidations?: Liquidation
  openInterest?: Array<number>
  priceDiffHL: number
  priceDiffOC: number
  oiDiff: number
  volumeStats: Stats
  tickStats: Stats
  priceDiffHLStats: Stats
  priceDiffOCStats: Stats
  oiDiffStats: Stats
  news?: Array<News>
}
