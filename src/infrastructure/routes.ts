import fastify from 'fastify'
import { getListByPeriod } from '../application/get-list-by-period'
import { spaguettiChartData } from "../application/spaguetti-chart-data";
import { betaData } from "../application/beta-data";
import { getImage } from './image';

export const routes = () => {
  const server = fastify({})

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  server.get('/symbols', async (request, reply) => {
    // @ts-ignore
    const period = request.query.period || '1D'
    // @ts-ignore
    const limit = request.query.limit || 100
    const list = await getListByPeriod(period, limit)

    const response = {
      pairs: [],
      refresh_period: 1800,
    }
    for (const item of list) {
      response.pairs.push(item.symbol.replace('USDT', '/USDT:USDT'))
    }
    reply.send(response)
  })


  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  server.get('/history', async (request, reply) => {
    // @ts-ignore
    const timeframe = request.query.timeframe
    // @ts-ignore
    const timeInterval = request.query.timeInterval
    // @ts-ignore
    const category = request.query.category
    const data = await spaguettiChartData(timeframe, timeInterval, category)

    reply.send(data)
  })

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  server.get('/beta', async (request, reply) => {
    // @ts-ignore
    const symbol = request.query.symbol
    // @ts-ignore
    const timeInterval = request.query.timeInterval
    // @ts-ignore
    const category = request.query.category

    const data = await betaData(parseInt(timeInterval), symbol.includes('USDT') ? symbol.toUpperCase() : `${symbol}USDT`.toUpperCase())

    reply.send(data)
  })
  
  server.get('/image', async (request, reply) => {

    // @ts-ignore
    const variable = request.query.variable
    // @ts-ignore
    const timeframe = request.query.timeframe
    // @ts-ignore
    const timeInterval = request.query.timeInterval
    // @ts-ignore
    const category = request.query.category

    const {labels, datasets, title, subtitle, error} = await spaguettiChartData(variable, timeframe, timeInterval, category)

    const image = await getImage(labels, datasets, title, subtitle)

    reply.type('text/html').send(`<html>
<head>
</head>
<body>
<img style="width: 1024px; height: 768px" src='data:image/jpeg;base64,${image.toString('base64')}'>
<p>
${JSON.stringify(datasets)}
</p>
</body>
</html>`)
  })

  server.listen({ port: 3000, host: '0.0.0.0' }, (error) => {
    if (error) {
      console.error(error)
      process.exit(1)
    }
  })
}
