export type Liquidation = {
  amount: number
  qty: number
  side: string
}

export const LiquidationDefault: Liquidation = {
  amount: 0,
  qty: 0,
  side: '',
}
