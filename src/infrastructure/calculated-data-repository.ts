import Sentry from '@sentry/node'
import ForerunnerDB from 'forerunnerdb'
import { getCollection, storeData as storeDataDatabase } from "./database";

const fdb = new ForerunnerDB()
const db = fdb.db('coins')
db.persist.dataDir('./var/data')

const DEFAULT_SIZE = 250

export const getOneLastBySymbol = async (
  symbol: string,
  defaultValue: any = undefined
) => {
  try {
    const collection = await getCollection(symbol, DEFAULT_SIZE)

    const result = collection.find(
      {
        symbol: {
          $eq: symbol,
        },
      },
      {
        $orderBy: {
          timestamp: -1,
        },
        $limit: 1,
      }
    )

    return result[0] || defaultValue
  } catch (err) {
    console.log('getLastBySymbol')
    console.log(symbol)
    console.log(err)
    Sentry.captureException(err)
  }
}

export const storeData = async (name: string, data: any) => {
  return storeDataDatabase(name, data, DEFAULT_SIZE)
}
