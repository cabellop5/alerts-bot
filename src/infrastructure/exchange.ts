import axios from 'axios'
import LRU_TTL from 'lru-ttl-cache'
import Binance from 'node-binance-api'
import { Candle } from '../domain/candle'
import { Liquidation, LiquidationDefault } from '../domain/liquidations'

const cache = new LRU_TTL({ ttl: '15m', ttlInterval: '60s' })
const binance = new Binance().options({
  APIKEY: process.env.BINANCE_APIKEY,
  APISECRET: process.env.BINANCE_APISECRET,
  family: 4,
})

const liquidations = {}
const openInterest = {}
const openInterest5m = {}
const openInterest15m = {}

export const getLiquidations = (symbol: string): Liquidation => {
  const liq = liquidations[symbol]
  liquidations[symbol] = LiquidationDefault
  return liq
}

export const getOpenInterest = (symbol: string): Array<number> => {
  const oi = openInterest[symbol] || []
  openInterest[symbol] = []
  return oi
}

export const getOpenInterest5m = (symbol: string): Array<number> => {
  const oi = openInterest5m[symbol] || []
  openInterest5m[symbol] = []
  return oi
}

export const getOpenInterest15m = (symbol: string): Array<number> => {
  const oi = openInterest15m[symbol] || []
  openInterest15m[symbol] = []
  return oi
}

export const getAllSymbols = async (): Promise<Array<string>> => {
  if (cache.has('symbols')) {
    return <Array<string>>cache.get('symbols')
  }

  const symbols: Array<string> = []
  const values = await getAllSymbolsWithCategory()

  for (const value of values) {
    symbols.push(value.symbol)
  }

  cache.set('symbols', symbols)

  return symbols
}

export const getAllSymbolsWithCategory = async (): Promise<Array<Record<string, any>>> => {
  if (cache.has('symbols_category')) {
    return <Array<Record<string, any>>>cache.get('symbols_category')
  }

  const result = []
  const symbols: Array<string> = []
  const response = await binance.futuresExchangeInfo()
  for (const symbol of response.symbols) {
    if (
        symbol.symbol.includes('USDT') &&
        !symbol.symbol.includes('_') &&
        !symbol.symbol.includes('COCOS') &&
        !symbol.symbol.includes('TOMO') &&
        !symbol.symbol.includes('USDC') &&
        !symbols.includes(symbol.symbol)
    ) {
      symbols.push(symbol.symbol)
      let categories = symbol.underlyingSubType || []
      categories = categories.map(category => category.replace(' ', ''))
      result.push({symbol: symbol.symbol, categories, lowercase_categories: categories.map(category => category.toLowerCase())})
    }
  }

  cache.set('symbols_category', result)

  return result
}

export const getCategories = async (): Promise<Array<string>> => {
  if (cache.has('categories')) {
    return <Array<string>>cache.get('categories')
  }

  const values = await getAllSymbolsWithCategory()
  const result = []

  for (const value of values) {
    for (const category of value.categories) {
      if (!result.includes(category)) {
        result.push(category)
      }
    }
    for (const category of value.lowercase_categories) {
      if (!result.includes(category)) {
        result.push(category)
      }
    }
  }

  cache.set('categories', result)

  return result
}

export const getRawCategories = async (): Promise<Array<string>> => {
  if (cache.has('raw_categories')) {
    return <Array<string>>cache.get('raw_categories')
  }

  const values = await getAllSymbolsWithCategory()
  const result = []

  for (const value of values) {
    for (const category of value.categories) {
      if (!result.includes(category)) {
        result.push(category)
      }
    }
  }

  cache.set('raw_categories', result)

  return result
}

export const getSymbolsByCategory = async (category: string): Promise<Array<string>> => {
  const values = await getAllSymbolsWithCategory()
  const result = []

  for (const value of values) {
    if (
        (value.categories.includes(category) || value.lowercase_categories.includes(category))
        && !result.includes(category)
    ) {
      result.push(value.symbol)
    }
  }

  return result
}

export const dataSubscription = async (
  callbacks: Record<string, Array<(data: Candle) => void>>
): Promise<void> => {
  const symbols = await getAllSymbols()
  binance.futuresCandlesticks(
    symbols,
    '1m',
    (candle: Record<string, any>): void => {
      if (candle.k.x) {
        const data: Candle = {
          volume: parseFloat(candle.k.v),
          tick: candle.k.n,
          timestamp: candle.k.t,
          timeframe: '1m',
          symbol: candle.s,
          open: parseFloat(candle.k.o),
          close: parseFloat(candle.k.c),
          high: parseFloat(candle.k.h),
          low: parseFloat(candle.k.l),
          liquidations: getLiquidations(candle.s),
          openInterest: getOpenInterest(candle.s),
        }
        for (const callback of callbacks['1m']) {
          callback(data)
        }
      }
    }
  )
  binance.futuresCandlesticks(
    symbols,
    '5m',
    (candle: Record<string, any>): void => {
      if (candle.k.x) {
        const data: Candle = {
          volume: parseFloat(candle.k.v),
          tick: candle.k.n,
          timestamp: candle.k.t,
          timeframe: '5m',
          symbol: candle.s,
          open: parseFloat(candle.k.o),
          close: parseFloat(candle.k.c),
          high: parseFloat(candle.k.h),
          low: parseFloat(candle.k.l),
          openInterest: getOpenInterest5m(candle.s),
        }
        for (const callback of callbacks['5m']) {
          callback(data)
        }
      }
    }
  )
  binance.futuresCandlesticks(
    symbols,
    '15m',
    (candle: Record<string, any>): void => {
      if (candle.k.x) {
        const data: Candle = {
          volume: parseFloat(candle.k.v),
          tick: candle.k.n,
          timestamp: candle.k.t,
          timeframe: '15m',
          symbol: candle.s,
          open: parseFloat(candle.k.o),
          close: parseFloat(candle.k.c),
          high: parseFloat(candle.k.h),
          low: parseFloat(candle.k.l),
          openInterest: getOpenInterest15m(candle.s),
        }
        for (const callback of callbacks['15m']) {
          callback(data)
        }
      }
    }
  )
  binance.futuresLiquidationStream((data: Record<string, any>): void => {
    const previousLiquidations = liquidations[data.symbol] || LiquidationDefault
    const amount =
      previousLiquidations.amount + data.totalFilledQty * data.price
    const qty = previousLiquidations.qty + 1
    liquidations[data.symbol] = {
      amount: amount,
      qty: qty,
      side: data.side,
    }
  })
}

export const getLastOpenInterest = async (): Promise<void> => {
  const symbols = await getAllSymbols()
  let promises = []
  const data: Record<string, any> = {}
  const getDataOI = (
    symbol: string,
    callback: (symbol: string, result: string) => void
  ) => {
    return binance.futuresOpenInterest(symbol).then((r) => callback(symbol, r))
  }

  for (const symbol of symbols) {
    promises.push(
      getDataOI(symbol, (symbol: string, result: string) => {
        if (data[symbol] === undefined) {
          data[symbol] = []
        }
        data[symbol].push(result)
      })
    )
  }
  await Promise.allSettled(promises)

  promises = []
  for (const symbol of symbols) {
    if (data[symbol] === undefined) {
      promises.push(
        getDataOI(symbol, (symbol: string, result: string) => {
          if (data[symbol] === undefined) {
            data[symbol] = []
          }
          data[symbol].push(result)
        })
      )
    }
  }
  await Promise.allSettled(promises)

  for (const key in data) {
    if (data[key] === undefined || data[key].length === 0) {
      continue
    }
    if (openInterest[key] === undefined) {
      openInterest[key] = []
    }
    if (openInterest5m[key] === undefined) {
      openInterest5m[key] = []
    }
    if (openInterest15m[key] === undefined) {
      openInterest15m[key] = []
    }
    openInterest[key].push(...data[key])
    openInterest5m[key].push(...data[key])
    openInterest15m[key].push(...data[key])
  }
}

export const getOpenInterestByTime = async (
  period: string
): Promise<Record<string, any>> => {
  const symbols = await getAllSymbols()
  let promises: Array<Promise<unknown>> = []
  const result: Record<string, any> = {}

  const getDataOI = async (
    symbol: string,
    period: string,
    data: Record<string, any>
  ) => {
    try {
      const r = await axios.get(
        `https://fapi.binance.com/futures/data/openInterestHist?symbol=${symbol}&period=${period}&limit=2`
      )
      data[symbol] = r.data
    } catch (e) {
      data[symbol] = undefined
    }
  }

  for (const symbol of symbols) {
    promises.push(getDataOI(symbol, period, result))
  }

  await Promise.allSettled(promises)
  promises = []

  for (const symbol in result) {
    if (result[symbol] === undefined) {
      promises.push(getDataOI(symbol, period, result))
    }
  }

  await Promise.allSettled(promises)

  return result
}

export const getCandle = async (
  symbol: string,
  interval: string,
  limit: number
): Promise<Record<string, any> | undefined> => {
  const response = await binance.promiseRequest('v1/klines', {
    symbol,
    interval,
    limit,
  })

  const data = response[0]
  if (data !== undefined) {
    return {
      open: data[1],
      high: data[2],
      low: data[3],
      close: data[4],
      volume: data[5],
      tick: data[8],
    }
  }
  return undefined
}

export const getLastPriceForSymbols = async (symbols?: Array<string>) => {
  const daily = await binance.futuresDaily()
  const result = {}

  Object.keys(daily).forEach((e) => {
    if (daily[e].symbol.includes('USDT')
        && !daily[e].symbol.includes('_')
        && !daily[e].symbol.includes('COCOS')
        && result[daily[e].symbol] === undefined
        && (symbols === undefined || symbols.includes(daily[e].symbol))
    ) {
      result[daily[e].symbol] = parseFloat(daily[e].lastPrice)
    }
  })

  return result
}