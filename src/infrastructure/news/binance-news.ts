import axios from 'axios'
import Xray from 'x-ray'
import { News } from '../../domain/news'
const x = Xray()

export const binanceNewsBySymbol = async (
  symbol: string
): Promise<Array<News>> => {
  const pair = symbol.replace('USDT', '')
  const url = `https://www.binance.com/bapi/composite/v1/public/cms/article/all/query?type=1&pageNo=1&pageSize=10&queryKeywords=${pair}&sortBy=2&apiVersion=V2`
  try {
    const response = await axios.get(url)
    const result = []
    for (const article of response.data.data.articles) {
      const time = new Date().getTime() - 120 * 60 * 1000

      if (article.publishDate >= time) {
        result.push({
          title: article.title,
          code: article.code,
          source: 'BINANCE',
          url: `https://www.binance.com/en/support/announcement/${article.code}`,
        })
      }
    }
    return result
  } catch (error) {
    return []
  }
}

export const binanceNews = async (): Promise<Array<News>> => {
  const result = []
  await new Promise((resolve) => {
    x(
      'https://www.binance.com/en/support/announcement/new-cryptocurrency-listing?c=48&navId=48',
      '#__APP_DATA'
    )((err, content) => {
      try {
        const time = new Date().getTime() - 240 * 30 * 60 * 1000
        const data = JSON.parse(content)
        const catalogs = []
        const tmp = data.appState?.loader?.dataByRouteId

        if (tmp !== undefined) {
          Object.keys(tmp).forEach((key) => {
            if (tmp[key].catalogs !== undefined) {
              catalogs.push(...tmp[key].catalogs)
            }
          })
        }

        for (const catalog of catalogs) {
          if (
              ['New Cryptocurrency Listing', 'Latest Binance News'].includes(
                  catalog.catalogName
              )
          ) {
            for (const article of catalog.articles) {
              if (
                  (article.title.includes('Binance Futures Will Launch') ||
                      article.title.match(/\(([A-Z]+)\)/g) !== null) &&
                  article.releaseDate > time
              ) {
                result.push({
                  title: article.title,
                  code: article.code,
                  source: 'BINANCE',
                  url: `https://www.binance.com/en/support/announcement/${article.code}`,
                })
              }
            }
          }
        }
        resolve(undefined)
      } catch (error) {
        resolve(undefined)
      }
    })
  })

  return result
}
