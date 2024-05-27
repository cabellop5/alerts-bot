import Sentry from '@sentry/node'
import ForerunnerDB from 'forerunnerdb'
import { getCollection, storeData as storeDataDatabase } from "./database";
import {HistoryData} from "../domain/history-data";
import {Timeframe} from "../domain/timeframe";

const fdb = new ForerunnerDB()
const db = fdb.db('coins')
db.persist.dataDir('./var/data')

const DEFAULT_SIZE = 250

const sizes: Record<string, number> = {
  '1m': 3000,
  '5m': 600,
  '15m': 400,
}

export const getOneBySymbolAndTimestamp = async (
    symbol: string,
    timestamp: number,
    timeframe: string
) => {
    try {
        const collection = await getCollection(`${symbol}_history_${timeframe}`, sizes[timeframe])

        const result = collection.find(
            {
                symbol: {
                    $eq: symbol,
                },
                timestamp: {
                    $lte: timestamp,
                }
            },
            {
                $orderBy: {
                    timestamp: -1,
                },
                $limit: 1,
            }
        )

        return result[0] || undefined
    } catch (err) {
        console.log('getLastBySymbol')
        console.log(symbol)
        console.log(err)
        Sentry.captureException(err)
    }
}

export const getBySymbolAndTimeframeBetweenTimestamps = async (
  symbol:string,
  timeframe: Timeframe,
  start: number,
  end: number,
) => {
  try {
    const collection = await getCollection(`${symbol}_history_${timeframe}`, sizes[timeframe])

    return collection.find(
      {
        timeframe: {
          $eq: timeframe,
        },
        symbol: {
          $eq: symbol
        },
        timestamp: {
          $gt: start,
          $lt: end,
        }
      },
      {
        $orderBy: {
          timestamp: 1,
        }
      }
    )
  } catch (err) {
    console.log('getBySymbolAndTimeframeBetweenTimestamps')
    console.log(symbol)
    console.log(err)
    Sentry.captureException(err)
  }
}

export const storeData = async (name: string, data: HistoryData) => {
  return storeDataDatabase(name, data, sizes[data.timeframe])
}
