export interface SWFTResponse<T> {
    data: T
    resCode: string
    resMsg: string
}

export interface SWFTOrderDetails {
    changeType: string
    choiseFeeType: string
    depositCoinAmt: string
    depositCoinCode: string
    depositCoinFeeAmt: string
    depositCoinFeeRate: string
    depositCoinState: string
    destinationAddr: string
    detailState: string
    developerId: string
    orderId: string
    orderState: string
    platformAddr: string
    receiveCoinAmt: string
    receiveCoinCode: string
    receiveSwftAmt: string
    refundAddr: string
    refundCoinAmt: string
    refundCoinMinerFee: string
    refundDepositTxid: string
    refundSwftAmt: string
    swftCoinFeeRate: string
    swftCoinState: string
    swftReceiveAddr: string
    swftRefundAddr: string
    transactionId: string
}

export interface SWFTRate {
    depositMax: string
    depositMin: string
    instantRate: string
    receiveCoinFee: string // Fixed fee to be payed in receive coin (not rate)
    minerFee: string // Only if SWFT token is used to pay fee
}

export interface SWFTPairDefinition {
    coinAllCode: string
    coinCode: string
    coinImageUrl: string
    coinName: string
    contact: string
    isSupportAdvanced: string
    mainNetwork: string
    noSupportCoin: string
}