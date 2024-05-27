import { Liquidation } from './liquidations'
import {Timeframe} from "./timeframe";

export type Candle = {
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
}
