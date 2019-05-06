export interface Pairs { [index: string]: string[] }

export interface Rate {
    depositMax: number
    depositMin: number
    instantRate: number
    receiveCoinFee: number // Fixed fee to be payed in receive coin (not rate)
    minerFee?: number // Only if SWFT token is used to pay fee
    depositCoinFeeRate?: number // Fee rate if SWFT token is not used to pay fee
}

export interface OrderDetails {
    id: string
    status: string
    created: string,
    deposit: {
        address: string,
        amount: number
        fee: number
        feeRate: number
        status: string,
        symbol: string
    }
    receive: {
        address: string
        amount: number
        symbol: string
        txid: string
    }
    refund: {
        address: string
        amount?: number
        fee?: number
        txid?: string
    }
}
