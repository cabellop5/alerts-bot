import { EmbedBuilder } from 'discord.js';
import { Summary } from '../../domain/summary'
import { Table } from 'embed-table'

export const summaryMessage = (data: Array<Summary>): any => {
  const table = new Table({
    titles: ['Symbol', 'Volume', 'Ticks', 'OI%'],
    titleIndexes: [0, 40, 78, 116],
    columnIndexes: [0, 20, 40, 60],
    start: '`',
    end: '`',
    padEnd: 3
  });

  for (const item of data) {
    table.addRow([item.symbol, item.volume.toFixed(2), `${item.ticks}`, item.oi.toFixed(2)])
  }

  return [new EmbedBuilder().setTitle('TOP 10 PAIRS OI% (1H)').setFields(table.toField())]
}
