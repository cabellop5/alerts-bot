import { HistoryData } from "../domain/history-data";
import { getAllSymbols } from "../infrastructure/exchange"
import { getBySymbolAndTimeframeBetweenTimestamps, getOneBySymbolAndTimestamp } from "../infrastructure/history-data-repository";
import * as ss from 'simple-statistics';

export const betaData = async (timeInterval: number, symbolPair: string): Promise<Record<string, any>> => {
    const symbols = await getAllSymbols()
    const endTime = new Date().getTime() - 60 * 1000
    const startTime = endTime - (timeInterval * 60 * 60 * 1000)
    const promises = []
    const data = {}
    const returns = {}
    const betas = {}

    for (const symbol of symbols) {
        promises.push(getBySymbolAndTimeframeBetweenTimestamps(symbol, '15m', startTime, endTime).then(result => {
            data[symbol] = result
        }))
    }

    await Promise.all(promises)

    const total = data[symbolPair].length
    for (const symbol of symbols) {
        returns[symbol] = calculateReturn(data[symbol], total)
    }

    const baseAsset = returns[symbolPair]
    const varianceMarket = ss.sampleVariance(baseAsset);

    for (const symbol of symbols) {
        const covariance = ss.sampleCovariance(returns[symbol], baseAsset)
        const beta = covariance / varianceMarket
        if (beta !== 0) {
            betas[symbol] = beta
        }
    }
    const all = Object.assign({}, sortBetas(betas))

    return { data: { top: filterBetas(betas, 'top'), bottom: filterBetas(betas, 'bottom'), all } }
}

function calculateReturn(prices: HistoryData[], total: number): number[] {
    const returns: number[] = [];
    for (const price of prices) {
        if (returns.length >= total) {
            break
        }
        const value = (price.close - price.open) / price.open;
        returns.push(value);
    }

    if (returns.length !== total) {
        const qty = total - returns.length
        for (let i = 0; i < qty; i++) {
            returns.push(returns[returns.length - 1])
        }
    }

    return returns;
}

function filterBetas(beta: Record<string, any>, type: string) {
    const result = {}
    let order = {}

    if (type === 'top') {
        order = Object.keys(beta)
            .sort((a, b) => beta[b] - beta[a])
            .reduce(
                (_sortedObj, key) => ({
                    ..._sortedObj,
                    [key]: beta[key]
                }),
                {}
            )
    } else {
        order = Object.keys(beta)
            .sort((a, b) => beta[a] - beta[b])
            .reduce(
                (_sortedObj, key) => ({
                    ..._sortedObj,
                    [key]: beta[key]
                }),
                {}
            )
    }

    let index = 0
    for (const [key, value] of Object.entries(order)) {
        if (index >= 15) {
            break
        }
        index++
        result[key] = value
    }

    return result
}

function sortBetas(beta: Record<string, any>) {
    return Object.keys(beta)
        .sort((a, b) => beta[b] - beta[a])
        .reduce(
            (_sortedObj, key) => ({
                ..._sortedObj,
                [key]: beta[key]
            }),
            {}
        )
}
