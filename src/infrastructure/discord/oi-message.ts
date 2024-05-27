import { EmbedBuilder } from 'discord.js'
import { CalculatedData } from '../../domain/calculated-data'

export const oiMessage = (data: CalculatedData) => {
  let emoji = ':green_circle:'

  if (data.close < data.open) {
    emoji = ':red_circle:'
  }

  const embed = new EmbedBuilder()
      .setTitle(`COIN - ${data.symbol} ${emoji}`)
      .setFields(
          { name: 'Price', value: data.close.toString(), inline: true },
          { name: 'Price %', value: data.priceDiffOC.toFixed(2), inline: true },
          { name: 'Liqs', value: data.liquidations?.amount.toFixed(2) || '0', inline: true },
          { name: 'OI %', value: data.oiDiff.toFixed(2), inline: true },
          { name: 'Volume', value: data.volume.toString(), inline: true },
          { name: 'Ticks', value: data.tick.toString(), inline: true }
      )

  for (const item of data.news) {
    embed.addFields({name: item.source, value: `${item.title} - ${item.url}`})
  }

  return [embed]
}
