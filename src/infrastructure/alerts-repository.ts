import { getCollection, storeData as storeDataDatabase } from "./database";
import Sentry from "@sentry/node";

const DEFAULT_SIZE = 250

export const getNewsSent = async (code: string) => {
    try {
        const collection = await getCollection('news', DEFAULT_SIZE)

        return collection.find({
            code: {
                $eq: code,
            },
        })
    } catch (err) {
        console.log('getNewsSent')
        console.log(code)
        console.log(err)
        Sentry.captureException(err)
        return undefined
    }
}

export const getAlertsByPairAndTime = async (
    symbol: string,
    timestamp: number
) => {
    try {
        const collection = await getCollection('cache_alerts', DEFAULT_SIZE)

        return collection.find(
            {
                symbol: {
                    $eq: symbol,
                },
                timestamp: {
                    $gte: timestamp,
                },
            },
            {
                $orderBy: {
                    timestamp: -1,
                },
            }
        )
    } catch (err) {
        console.log('getAlertsByPairAndTime')
        console.log(symbol, timestamp)
        console.log(err)
        Sentry.captureException(err)
    }
}

export const storeData = async (name: string, data: any) => {
    return storeDataDatabase(name, data, DEFAULT_SIZE)
}