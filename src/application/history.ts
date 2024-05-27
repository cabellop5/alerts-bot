import { Candle } from "../domain/candle";
import { getPercentageDiff } from "./utils";
import { HistoryData } from "../domain/history-data";
import { storeData } from "../infrastructure/history-data-repository";

export const history = async (data: Candle): Promise<void> => {
    const {liquidations, ...values} = data;
    const historyData: HistoryData = {
        ...values,
        priceDiffOC: getPercentageDiff(data.open, data.close),
        priceDiffHL: getPercentageDiff(data.high, data.low)
    }

    await storeData(`${historyData.symbol}_history_${historyData.timeframe}`, historyData)
}