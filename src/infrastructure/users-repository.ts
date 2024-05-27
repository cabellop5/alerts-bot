import Sentry from '@sentry/node'
import ForerunnerDB from 'forerunnerdb'
import { getCollection, storeData as storeDataDatabase } from "./database";

const fdb = new ForerunnerDB()
const db = fdb.db('coins')
db.persist.dataDir('./var/data')

const DEFAULT_SIZE = 2500

export const getAll = async () => {
    try {
        const collection = await getCollection('users', DEFAULT_SIZE)

        const result = collection.find(
            {
                count: {
                    $gte: 1,
                },
            }
        )

        return result
    } catch (err) {
        console.log('getAll')
        console.log('users')
        console.log(err)
        Sentry.captureException(err)
    }
}

export const storeData = async (data: any) => {
    return storeDataDatabase('users', data, DEFAULT_SIZE)
}