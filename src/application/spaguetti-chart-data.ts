import { Timeframe, TIMEFRAMES } from "../domain/timeframe";
import { Variable, VARIABLES } from "../domain/variable";
import { getAllSymbols, getCategories, getSymbolsByCategory, getLastPriceForSymbols } from "../infrastructure/exchange";
import { getBySymbolAndTimeframeBetweenTimestamps, getOneBySymbolAndTimestamp } from "../infrastructure/history-data-repository";
import { getPercentageDiff } from "./utils";

const MAX_PAIRS = 10

export const spaguettiChartData = async (variable: Variable, timeframe: Timeframe, timeInterval: number, category?: string) => {
    if (!VARIABLES.includes(variable)) {
        return {
            error: `Variable not in allowed variables: ${VARIABLES.join(',')}`
        }
    }

    if (!TIMEFRAMES.includes(timeframe)) {
        return {
            error: `Timeframe not in allowed timeframes: ${TIMEFRAMES.join(',')}`
        }
    }

    if (timeInterval > 48) {
        return {
            error: 'TimeInterval not can be more than 48 hours'
        }
    }

    if (category !== undefined && category !== 'all') {
        const categories = await getCategories()
        if (!categories.includes(category)) {
            return {
                error: 'Category is not in categories list'
            }
        }
    }

    let symbols = await getAllSymbols()

    if (category !== undefined && category !== 'all') {
        symbols = await getSymbolsByCategory(category)
    }

    const data = {}
    const endTime = new Date().getTime() - 60 * 1000
    const startTime = endTime - (timeInterval * 60 * 60 * 1000)

    const change = await getPriceChangeBySymbols(symbols, startTime)

    if (category === undefined || category !== 'all') {
        symbols = filterTop10Change(change)
    }

    if (!symbols.includes('BTCUSDT')) {
        symbols.push('BTCUSDT')
    }

    if (!symbols.includes('ETHUSDT')) {
        symbols.push('ETHUSDT')
    }

    const promises = []

    for (const symbol of symbols) {
        promises.push(getBySymbolAndTimeframeBetweenTimestamps(symbol, timeframe, startTime, endTime).then(result => {
            data[symbol] = result
        }))
    }

    await Promise.all(promises)

    const { labels, index } = generateLabelsAndIndexFromBtcData(data['BTCUSDT'])
    const datasets = []
    let i = 0

    for (const symbol of symbols) {
        datasets.push(getDataset(variable, symbol, data[symbol], index, i, symbols.length))
        i++
    }

    const title = `${textByVariable(variable)} ${category ? category.toUpperCase() : ''} CHART [${timeframe}] [${timeInterval}H]`
    const subtitle = symbols.length <= 15 ? symbols.join(',').replace(/USDT/g, '') : 'ALL PAIRS'

    datasets.sort((a, b) => b['last'] - a['last'])

    return {labels, datasets, title, subtitle}
}

async function getPriceChangeBySymbols(symbols, timestamp): Promise<Record<string, any>> {
    const startPrice = {}
    const promises = []

    for (const symbol of symbols) {
        promises.push(getOneBySymbolAndTimestamp(symbol, timestamp, '15m').then(result => {
            startPrice[symbol] = result.close || undefined
        }))
    }
    await Promise.allSettled(promises)

    const endPrice = await getLastPriceForSymbols(symbols)
    const result = {}

    for (const symbol of symbols) {
        if (startPrice[symbol] !== undefined && endPrice[symbol] !== undefined) {
            result[symbol] = getPercentageDiff(startPrice[symbol], endPrice[symbol])
        }
    }

    return result
}

function textByVariable(variable: string): string {
    const obj = {
        price: 'PRICE',
        oi: 'OPEN INTEREST',
        volume: 'VOLUME',
        ticks: 'TICKS',
    }

    return obj[variable]
}

function filterTop10Change(data) {
    const sortable = Object.entries(data)
        .sort(([,a]: Array<any>,[,b]: Array<any>) => b - a)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {})

    return Object.keys(sortable).slice(0, MAX_PAIRS)
}

function getDataByVariable(variable: string, data) {
    let result
    switch (variable) {
        case 'price':
            result = data['close']
            break
        case 'oi':
            const oi = data['openInterest'] && data['openInterest'].length >= 1 ? data['openInterest'] : [0]
            result = oi[oi.length - 1]
            break
        case 'ticks':
            result = data['tick']
            break
        case 'volume':
            result = data['volume']
            break
    }

    return result
}

function getDataset(variable, symbol, data, index, i, qtyColors) {
    const items = []
    const start = getDataByVariable(variable, data[0])

    for (const item of data) {
        if (index.includes(item.timestamp)) {
            const tempVar = getDataByVariable(variable, item)
            const value = ((tempVar - start) / start * 100)
            items.push(value)
        }
    }

    if (items.length !== index.length) {
        const qty = index.length - items.length
        for (let i = 0; i < qty; i++) {
            items.push(items[items.length - 1])
        }
    }

    const color = "hsl( " + makeColor(i, qtyColors + 1) + ", 100%, 50% )";

    return {
        label: symbol,
        borderColor: color,
        data: items,
        last: items[items.length - 1],
        count: items.length,
        lineTension: 0.3,
        max: Math.max(...items),
        min: Math.min(...items),
    }
}

function makeColor(colorNum, colors){
    if (colors < 1) {
        colors = 1
    }
    return colorNum * (360 / colors) % 360
}

function generateLabelsAndIndexFromBtcData(data) {
    const labels = []
    const index = []

    for (const item of data) {
        index.push(item.timestamp)
        const date = new Date(item.timestamp)
        if (date.getMinutes() === 0) {
            labels.push(date.getHours() + 'H')
        } else if ([15,30,45].includes(date.getMinutes())) {
            labels.push(date.getMinutes() + "'")
        } else {
            labels.push('')
        }
    }

    return { labels, index }
}