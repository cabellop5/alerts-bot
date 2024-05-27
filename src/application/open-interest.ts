import { getLastOpenInterest } from '../infrastructure/exchange'

export const openInterest = () => {
  return getLastOpenInterest()
}
