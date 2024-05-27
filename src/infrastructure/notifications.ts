import {
  sendCandlesDiscord,
  sendNewDiscord,
  sendOiDiscord,
  sendSummaryDiscord,
} from './discord/discord-notifications'
import { CalculatedData } from '../domain/calculated-data'
import { News } from '../domain/news'
import { Summary } from '../domain/summary'

export const sendSummary = async (data: Array<Summary>): Promise<void> => {
  await sendSummaryDiscord(data)
}

export const sendNew = async (item: News): Promise<void> => {
  await sendNewDiscord(item)
}

export const sendOi = async (item: CalculatedData): Promise<void> => {
  await sendOiDiscord(item)
}

export const sendCandles = async (
  parameters: CalculatedData
): Promise<void> => {
  await sendCandlesDiscord(parameters)
}
