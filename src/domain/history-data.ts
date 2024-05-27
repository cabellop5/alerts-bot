import {Timeframe} from "./timeframe";

export type HistoryData = {
  volume: number
  tick: number
  timestamp: number
  timeframe: Timeframe
  symbol: string
  open: number
  close: number
  high: number
  low: number
  priceDiffHL: number
  priceDiffOC: number
}
