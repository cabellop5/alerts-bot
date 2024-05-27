import Sentry from '@sentry/node'
import ForerunnerDB from 'forerunnerdb'

const fdb = new ForerunnerDB()
const db = fdb.db('coins')
db.persist.dataDir('./var/data')

const loadedCollections = {}

export async function getCollection(name: string, size: number) {
    try {
        const collectionName = `coin_${name}`
        const collection = db.collection(`coin_${name}`, {
            autoCreate: true,
            capped: true,
            size: size,
        })

        if (!loadedCollections[collectionName]) {
            await new Promise<void>((r) => {
                collection.load((err) => {
                    if (err) {
                        console.log(err)
                        loadedCollections[collectionName] = undefined
                    } else {
                        loadedCollections[collectionName] = true
                    }
                    r()
                })
            })
        }

        return collection
    } catch (err) {
        console.log('getCollection')
        console.log(name)
        console.log(err)
        Sentry.captureException(err)
    }
}

export const storeData = async (name: string, data: any, size: number) => {
    try {
        const collection = await getCollection(name, size)
        collection.insert(data)
        await new Promise<void>((r) => {
            collection.save((err) => {
                if (err) {
                    console.log(err)
                }
                r()
            })
        })
    } catch (err) {
        console.log('storeData')
        console.log(name, data)
        console.log(err)
        Sentry.captureException(err)
    }
}