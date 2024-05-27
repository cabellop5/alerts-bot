import {getCollection} from "./database";
import Sentry from "@sentry/node";

const DEFAULT_SIZE = 250

export const getOneSymbolList = async (
    period: string
): Promise<Record<string, any> | undefined> => {
    try {
        const collection = await getCollection('symbol_list', DEFAULT_SIZE)

        const result = collection.find(
            {
                period: {
                    $eq: period,
                },
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
        console.log('getSymbolList')
        console.log(period)
        console.log(err)
        Sentry.captureException(err)
        return undefined
    }
}