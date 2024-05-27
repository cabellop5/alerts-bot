import { EmbedBuilder } from 'discord.js'
import { News } from '../../domain/news'

export const newsMessage = (item: News) => {
  const embed = new EmbedBuilder()
      .setTitle( item.title)
      .addFields({name: 'Link', value: item.url})

  return [embed]
}
