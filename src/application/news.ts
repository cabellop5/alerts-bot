import { twitterNews } from '../infrastructure/news/twitter-news'
import { upbitNews } from '../infrastructure/news/upbit-news'
import { getNewsSent, storeData } from '../infrastructure/alerts-repository'
import {
  binanceNews,
  binanceNewsBySymbol,
} from '../infrastructure/news/binance-news'
import { sendNew } from '../infrastructure/notifications'

export const news = async () => {
  let news = await binanceNews()

  for (const item of news) {
    const newsSent = await getNewsSent(item.code)
    if (newsSent.length === 0) {
      await storeData('news', { ...item, timestamp: new Date().getTime() })
      await sendNew(item)
    }
  }

  news = await twitterNews()

  for (const item of news) {
    const newsSent = await getNewsSent(item.code)
    if (newsSent.length === 0) {
      await storeData('news', { ...item, timestamp: new Date().getTime() })
      await sendNew(item)
    }
  }

  news = await upbitNews()

  for (const item of news) {
    const newsSent = await getNewsSent(item.code)
    if (newsSent.length === 0) {
      await storeData('news', { ...item, timestamp: new Date().getTime() })
      await sendNew(item)
    }
  }
}

export const newsBySymbol = async (symbol: string) => {
  const news = await binanceNewsBySymbol(symbol)

  return news
}
