import * as Sentry from '@sentry/node'
import { CronJob } from 'cron'
import { generateListByOi } from '../application/generate-list-by-oi'
import { news } from '../application/news'
import { openInterest } from '../application/open-interest'
import { summary } from '../application/summary'
import { users } from '../application/users'

export const cron = () => {
  const jobGetData = new CronJob('20,50 * * * * *', async () => {
    try {
      await openInterest()
    } catch (err) {
      console.log('OpenInterest Error')
      console.log(err)
      Sentry.captureException(err)
    }
  })
  jobGetData.start()

  const jobCheckNews = new CronJob('* * * * *', async () => {
    try {
      await news()
    } catch (err) {
      console.log('News Error')
      console.log(err)
      Sentry.captureException(err)
    }
  })
  jobCheckNews.start()

  const jobUsers = new CronJob('* * * * *', async () => {
    try {
      await users()
    } catch (err) {
      console.log('Users Error')
      console.log(err)
      Sentry.captureException(err)
    }
  })
  jobUsers.start()

  const jobList1H = new CronJob('1 * * * *', async () => {
    try {
      await generateListByOi('1h')
      await summary()
    } catch (err) {
      console.log('jobList1H Error')
      console.log(err)
      Sentry.captureException(err)
    }
  })
  jobList1H.start()

  const jobList4H = new CronJob('0 */4 * * *', async () => {
    try {
      await generateListByOi('4h')
    } catch (err) {
      console.log('jobList4H Error')
      console.log(err)
      Sentry.captureException(err)
    }
  })
  jobList4H.start()

  const jobList1D = new CronJob('0 3 * * *', async () => {
    try {
      await generateListByOi('1D')
    } catch (err) {
      console.log('jobList1D Error')
      console.log(err)
      Sentry.captureException(err)
    }
  })
  jobList1D.start()
}

export const initialJobs = async (): Promise<void> => {
  await generateListByOi('1h')
  await generateListByOi('4h')
  await generateListByOi('1D')
}
