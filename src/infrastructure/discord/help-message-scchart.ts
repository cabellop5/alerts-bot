import { EmbedBuilder } from "discord.js"
import { getRawCategories } from "../../infrastructure/exchange"

export const helpMessageScchart = async () => {
    const categories = await getRawCategories()
    return [new EmbedBuilder()
        .setTitle('SPAGUETTI CHART COMMAND HELP')
        .setDescription('The command allow the following arguments')
        .setFields(
            { name: 'sc {variable} {timeframe} {hours} {category_tokens}', value: '\u200B' },
            { name: 'variable', value: 'Variable represented in chart. Available: price | volume | oi | ticks' },
            { name: 'timeframe', value: 'Timeframe for draw the chart. Available: 1m | 5m | 15m' },
            { name: 'hours', value: 'Quantity of hours for chart. Min 1 - 48 Max' },
            { name: 'category_tokens', value: `Optional argument. Filter category of tokens Available: ${categories.join(' | ')}` },
            { name: 'EXAMPLE', value: 'sc price 5m 12 layer-1' }
        )
    ]
}