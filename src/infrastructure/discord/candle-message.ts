import { EmbedBuilder } from 'discord.js'
import { CalculatedData } from '../../domain/calculated-data'

export const candleMessage = (data: CalculatedData) => {
  let emoji = ':green_circle:'

  if (data.liquidations.side === 'BUY') {
    emoji = ':red_circle:'
  }

  const embed = new EmbedBuilder()
      .setTitle(`COIN - ${data.symbol} ${emoji}`)
      .setFields(
          { name: 'Price', value: data.close.toString(), inline: true },
          { name: 'Price %', value: data.priceDiffOC.toFixed(2), inline: true },
          { name: 'Liqs', value: data.liquidations?.amount.toString() || '0', inline: true },
          { name: 'OI %', value: data.oiDiff.toFixed(2), inline: true },
          { name: 'Volume', value: data.volume.toString(), inline: true },
          { name: 'Ticks', value: data.tick.toString(), inline: true }
      )

  return [embed]
}
