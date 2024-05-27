import { Scraper } from "@the-convocation/twitter-scraper";
import { News } from "../../domain/news";

const users = ['1282727055604486148', '2361601055', '1691485239409881093']
let retries = 0
const scraper = new Scraper()

export const twitterNews = async (): Promise<Array<News>> => {
    const result = []
    try {
        const logged = await scraper.isLoggedIn()
        if (!logged && retries < 3) {
            retries++
            await scraper.login(process.env.API_TWITTER_USERNAME, process.env.API_TWITTER_PASSWORD, process.env.API_TWITTER_EMAIL)
        }
        for (const user of users) {
            for await (const value of scraper.getTweetsByUserId(user, 10)) {
                result.push({
                    title: value.text,
                    code: value.id,
                    source: 'TWITTER',
                    url: value.permanentUrl,
                    author: value.name,
                })
            }
        }

        return result
    } catch (error) {
        console.log('Twitter error', error)
        return []
    }
}