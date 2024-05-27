import { Client, GatewayIntentBits } from 'discord.js'
import { candleMessage } from './candle-message'
import { newsMessage } from './news-message'
import { oiMessage } from './oi-message'
import { summaryMessage } from './summary-message'
import { CalculatedData } from '../../domain/calculated-data'
import { News } from '../../domain/news'
import { Summary } from '../../domain/summary'
import * as process from "process";
import { getImage } from "../image";
import { spaguettiChartData } from '../../application/spaguetti-chart-data'
import { Timeframe } from '../../domain/timeframe'
import { helpMessageScchart } from './help-message-scchart'
import { Variable } from 'domain/variable'
import { helpMessageBeta } from './help-message-beta'
import { betaData } from '../../application/beta-data'
import { betaMessage } from './beta-message'
import { getAll } from '../users-repository'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent
  ]
})
const DISCORD_TOKEN = process.env.DISCORD_TOKEN
let channelSummary
let channelCandles
let channelOi
let channelNews

client.login(DISCORD_TOKEN).then(async () => {
  channelSummary = await client.channels.fetch(
    process.env.DISCORD_SUMMARY_CHAT_ID
  )
  channelCandles = await client.channels.fetch(
    process.env.DISCORD_CANDLES_CHAT_ID
  )
  channelOi = await client.channels.fetch(process.env.DISCORD_OI_CHAT_ID)
  channelNews = await client.channels.fetch(process.env.DISCORD_NEWS_CHAT_ID)
})

client.on('messageCreate', async (message) => {
  if (message.author.bot) {
    return
  }
  if (message.content.toLowerCase().startsWith('sc ')) {
    manageScCommand(message)
    return
  }

  if (message.content.toLowerCase().startsWith('beta ')) {
    manageBetaCommand(message)
    return
  }

  if (message.content.toLowerCase().startsWith('summary-users ')) {
    manageUsersCommand(message)
    return
  }

})

const manageUsersCommand = async (message) => {
  const args = message.content.toLowerCase().replace('summary-users ', '').split(' ')
  const qty = args[0] || 10
  const items = await getAll()
  const data = []

  for (const item of items) {
    data.push(...item.users)
  }

  const result = {};
  data.forEach(function (x) { result[x] = (result[x] || 0) + 1; });
  const users = filterTop10(result, qty)
  let text = ''
  Object.keys(users).forEach(e => text += `${e} - ${users[e]}
`)

  message.reply({content: `TOTAL: ${items.length}
USERS: 
${text}`})
}

function filterTop10(data, qty) {
  const sortable = Object.entries(data)
      .sort(([,a]: Array<any>,[,b]: Array<any>) => b - a)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {})
  const result = {}
  Object.keys(sortable).slice(0, qty).forEach(e => result[e] = sortable[e])
  return result
}

const manageBetaCommand = async (message) => {

  const args = message.content.toLowerCase().replace('beta ', '').split(' ')

  if (args.length === 1 && args[0] === 'help') {
    message.reply({embeds: helpMessageBeta()});
    return
  }

  if (args.length < 2) {
    message.reply({embeds: helpMessageBeta(), content: 'Missed options in command'})
    return
  }

  const timeInterval = parseInt(args[0])
  const symbol = args[1].includes('USDT') ? args[1].toUpperCase() : `${args[1]}USDT`.toUpperCase()

  try {
    const data = await betaData(timeInterval, symbol)

    message.reply({embeds: betaMessage(data)})
  } catch (error) {
    message.reply(message.reply({embeds: helpMessageBeta(), content: 'Error occurred when generate beta.'}))
  }
}

const manageScCommand = async (message) => {
  const args = message.content.toLowerCase().replace('sc ', '').split(' ')

  if (args.length === 1 && args[0] === 'help') {
    message.reply({embeds: await helpMessageScchart()});
    return
  }

  if (args.length < 3) {
    message.reply({embeds: await helpMessageScchart()});
    return
  }

  const variable = args[0] as Variable
  const timeframe = args[1] as Timeframe
  const timeInterval = parseInt(args[2])
  const category = args[3] || undefined

  try {
    const {labels, datasets, title, subtitle, error} = await spaguettiChartData(variable, timeframe, timeInterval, category)

    if (error !== undefined) {
      message.reply({embeds: await helpMessageScchart(), content: `Error occurred when generate chart. ${error}`});
      return
    }

    const image = await getImage(labels, datasets, title, subtitle)
    message.reply({files: [{attachment: image}]});
  } catch (error) {
    message.reply({embeds: await helpMessageScchart(), content: `Error occurred when generate chart.`});
  }
}

export const sendSummaryDiscord = async (
  data: Array<Summary>
): Promise<void> => {
  channelSummary.send({ embeds: summaryMessage(data) })
}

export const sendNewDiscord = async (item: News): Promise<void> => {
  channelNews.send({ embeds: newsMessage(item) })
}

export const sendOiDiscord = async (item: CalculatedData): Promise<void> => {
  channelOi.send({ embeds: oiMessage(item) })
}

export const sendCandlesDiscord = async (
  data: CalculatedData
): Promise<void> => {
  channelCandles.send({ embeds: candleMessage(data) })
}

export const usersInServer = async (): Promise<Array<string>> => {
  try {
    const now = new Date()
    const date = now.getTime() - (10 * 365 * 24 * 60 * 60 * 1000)
    const guild = client.guilds.cache.get(process.env.DISCORD_GUILD)
    let response = await guild.members.fetch();
    const result: Array<string> = []
    response.forEach((member) => {
      if (
          member.presence !== null
          && member.presence.status !== 'offline'
          && !member.user.bot
          && member.user.createdTimestamp > date
          && member.user.avatar === null
      ) {
        result.push(member.user.username)
      }
    })
    return result
  } catch (error) {
    console.log(error)
    return []
  }
}