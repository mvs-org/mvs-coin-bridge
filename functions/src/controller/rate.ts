import { SWFT_DEFAULT_FEE_RATE } from '../config/swft.config';
import { SWFTRate, SWFTResponse } from '../interfaces/swft.interfaces';
import { Rate } from '../interfaces/output.interfaces';

import express = require('express')
import { getRate } from '../provider/swft.provider';

export const rateApp = express()

/**
 * @api {get} /rate/:depositSymbol/:receiveSymbol Get rate information
 * @apiName GetRate
 * @apiGroup Rate
 *
 * @apiParam {String} depositSymbol Symbol of the asset to deposit.
 * @apiParam {String} receiveSymbol Symbol of the asset to receive.
 *
 * @apiSuccess {Number} depositMax Max possible amount to transfer
 * @apiSuccess {Number} depositMin Min possible amount to transfer
 * @apiSuccess {Number} instantRate Current rate
 * @apiSuccess {Number} receiveCoinFee Fee that gets deducted in receiving currency
 * @apiSuccess {Number} depositCoinFeeRate Rate for the fee that gets deducted from deposit amount
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "depositMax": 1,
 *          "depositMin": 0.001,
 *          "instantRate": 9180.54065255805,
 *          "receiveCoinFee": 0.464492,
 *          "depositCoinFeeRate": 0.002
 *      }
 */
rateApp.get('*/:deposit/:receive', async (request: any, response: any) => {
    try {
        const depositSymbol: string = request.params.deposit
        const receiveSymbol: string = request.params.receive

        if (depositSymbol !== 'ETP' && receiveSymbol !== 'ETP') throw Error('Only ETP pairs supported')
        if (depositSymbol.toLowerCase() === receiveSymbol.toLowerCase()) throw Error('Illegal pair')

        const rawRateResponse: SWFTResponse<SWFTRate> = await getRate(depositSymbol, receiveSymbol)

        const res: Rate = {
            depositMax: parseFloat(rawRateResponse.data.depositMax),
            depositMin: parseFloat(rawRateResponse.data.depositMin),
            instantRate: parseFloat(rawRateResponse.data.instantRate),
            receiveCoinFee: parseFloat(rawRateResponse.data.receiveCoinFee),
            depositCoinFeeRate: SWFT_DEFAULT_FEE_RATE,
        }

        response.json(res)

    } catch (error) {
        console.error(error)
        response.status(500).send(error.message)
    }
})
