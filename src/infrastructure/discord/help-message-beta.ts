import { EmbedBuilder } from "discord.js";

export const helpMessageBeta = () => {
    return [new EmbedBuilder()
        .setTitle('BETA COMMAND HELP')
        .setDescription('The beta command allow the following arguments')
        .setFields(
            { name: 'beta {hours} {base_token}', value: '\u200B' },
            { name: 'hours', value: 'Quantity of hours for calculate. Min 1 - 48 Max' },
            { name: 'base_token', value: 'Token for reference to calculate Beta' },
            { name: 'EXAMPLE', value: 'beta 12h btc' }
        )
    ]
}