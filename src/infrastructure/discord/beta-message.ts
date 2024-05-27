import { EmbedBuilder } from "discord.js";
import { Table } from "embed-table";

export const betaMessage = (data: Record<string, Record<string, number>>): EmbedBuilder[] => {
  const options = {
    titles: ['Symbol', 'Beta'],
    titleIndexes: [0, 40],
    columnIndexes: [0, 20],
    start: '`',
    end: '`',
    padEnd: 3
  }
  
  const tableTop = new Table(options);
  const tableBottom = new Table(options);

  for (const [key, value] of Object.entries(data.data.top)) {
    tableTop.addRow([key, value.toFixed(3)])
  }
  for (const [key, value] of Object.entries(data.data.bottom)) {
    tableBottom.addRow([key, value.toFixed(3)])
  }

  const embedTop = new EmbedBuilder().setTitle('PAIRS TOP BETA').setFields(tableTop.toField());
  const embedBottom = new EmbedBuilder().setTitle('PAIRS BOTTOM BETA').setFields(tableBottom.toField());

  return [embedTop, embedBottom]
}
