import { Request, Response } from 'express';
import express = require('express')
import bodyParser = require('body-parser')
import { SWFTOrderDetails, SWFTResponse } from '../interfaces/swft.interfaces';
import { OrderDetails } from '../interfaces/output.interfaces';
import { firestore, initializeApp } from 'firebase-admin';
import { getOrderState, CreateOrderParameters, createOrder } from '../provider/swft.provider';

initializeApp()

export const orderApp = express()
orderApp.use(bodyParser.json({ type: 'application/*+json' }))

/**
 * @api {get} /order/:id Get order details
 * @apiName GetOrder
 * @apiGroup Order
 *
 * @apiParam {String} id Order unique ID.
 *
 * @apiSuccess {String} id Identifier for the order
 * @apiSuccess {String} status Status message
 * @apiSuccess {Object} deposit Information about the deposit side of the trade
 * @apiSuccess {String} deposit.address Address to deposit the asset that should be traded
 * @apiSuccess {Number} deposit.amount Amount to transfer
 * @apiSuccess {Number} deposit.fee Fee that was calculated for the send amount (included in amount)
 * @apiSuccess {Number} deposit.feeRate Fee rate that was used to calculate the fee
 * @apiSuccess {String} deposit.status Status of the deposit
 * @apiSuccess {String} deposit.symbol Symbol of asset that the user wants to trade
 * @apiSuccess {Object} receive Information about the receive side of the trade
 * @apiSuccess {String} receive.address Address to receive the asset the user wants to get
 * @apiSuccess {Number} receive.amount Amount to receive
 * @apiSuccess {String} receive.symbol Symbol of asset that the user wants to receive
 * @apiSuccess {String} receive.txid Transaction id of the receive tx (if transfer completed)
 * @apiSuccess {Object} refund Information about a potential refund in error case
 * @apiSuccess {String} refund.address Address to receive a refund in case of an error
 * @apiSuccess {String} refund.amount Amount of a refund (only exists in error case)
 * @apiSuccess {String} refund.fee Fee of the refund (only exists in error case)
 * @apiSuccess {String} refund.txid Transaction id of the refund (only exists in error case)
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "id": "bfd51d04-62e9-49d2-8b2f-84b6f2514508",
 *          "status": "wait_deposit_send",
 *          "deposit": {
 *              "address":"3LcPdD8MZbgncpGjyFKDd2fSNuUGZEtLaK",
 *              "amount": 0.1,
 *              "fee": 0.0002,
 *              "feeRate": 0.002,
 *              "status": "wait_send",
 *              "symbol":"BTC"
 *          },
 *          "receive": {
 *              "address": "MSCHL3unfVqzsZbRVCJ3yVp7RgAmXiuGN3",
 *              "amount": 918.43345,
 *              "symbol": "ETP",
 *              "txid": ""
 *          },
 *          "refund": {
 *              "address": "18orDLFMp3fGoy5Uk93LDGTGbxWEm7b7FY"
 *          }
 *      }
 */
orderApp.get('*/:id', async (request: Request, response: Response) => {
    try {

        const id = request.params.id

        const rawResponse: SWFTResponse<SWFTOrderDetails> = await getOrderState(id)

        const order = parseSWFTOrderDetails(rawResponse)

        response.json(order)

        saveOrder(order, rawResponse)
            .catch(error => {
                console.log(`error updating db record of unknown order ${order.id}: ${error.message}`)
            })

    } catch (error) {
        console.error(error)
        response.status(500).send(error.message)
    }
})

/**
 * @api {post} /order Create new order
 * @apiName CreateOrder
 * @apiGroup Order
 *
 * @apiParam {String} depositSymbol Symbol of the asset to deposit.
 * @apiParam {String} receiveSymbol Symbol of the asset to receive.
 * @apiParam {Number} depositAmount Amount of the asset to deposit.
 * @apiParam {Number} receiveAmount Amount of the asset to receive.
 * @apiParam {String} refundAddress Address to send the deposit funds in case of a problem.
 * @apiParam {String} receiveAddress Address to send the funds to.
 * 
 * @apiSuccess {String} id Identifier for the order
 * @apiSuccess {String} status Status message
 * @apiSuccess {Object} deposit Information about the deposit side of the trade
 * @apiSuccess {String} deposit.address Address to deposit the asset that should be traded
 * @apiSuccess {Number} deposit.amount Amount to transfer
 * @apiSuccess {Number} deposit.fee Fee that was calculated for the send amount (included in amount)
 * @apiSuccess {Number} deposit.feeRate Fee rate that was used to calculate the fee
 * @apiSuccess {String} deposit.status Status of the deposit
 * @apiSuccess {String} deposit.symbol Symbol of asset that the user wants to trade
 * @apiSuccess {Object} receive Information about the receive side of the trade
 * @apiSuccess {String} receive.address Address to receive the asset the user wants to get
 * @apiSuccess {Number} receive.amount Amount to receive
 * @apiSuccess {String} receive.symbol Symbol of asset that the user wants to receive
 * @apiSuccess {String} receive.txid Transaction id of the receive tx (if transfer completed)
 * @apiSuccess {Object} refund Information about a potential refund in error case
 * @apiSuccess {String} refund.address Address to receive a refund in case of an error
 * @apiSuccess {String} refund.amount Amount of a refund (only exists in error case)
 * @apiSuccess {String} refund.fee Fee of the refund (only exists in error case)
 * @apiSuccess {String} refund.txid Transaction id of the refund (only exists in error case)
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *          "depositSymbol":"BTC",
 *          "receiveSymbol":"ETP",
 *          "depositAmount": 0.1,
 *          "receiveAmount":930,
 *          "refundAddress": "18orDLFMp3fGoy5Uk93LDGTGbxWEm7b7FY",
 *          "receiveAddress": "MSCHL3unfVqzsZbRVCJ3yVp7RgAmXiuGN3"
 *      }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "id": "bfd51d04-62e9-49d2-8b2f-84b6f2514508",
 *          "status": "wait_deposit_send",
 *          "deposit": {
 *              "address":"3LcPdD8MZbgncpGjyFKDd2fSNuUGZEtLaK",
 *              "amount": 0.1,
 *              "fee": 0.0002,
 *              "feeRate": 0.002,
 *              "status": "wait_send",
 *              "symbol":"BTC"
 *          },
 *          "receive": {
 *              "address": "MSCHL3unfVqzsZbRVCJ3yVp7RgAmXiuGN3",
 *              "amount": 918.43345,
 *              "symbol": "ETP",
 *              "txid": ""
 *          },
 *          "refund": {
 *              "address": "18orDLFMp3fGoy5Uk93LDGTGbxWEm7b7FY"
 *          }
 *      }
 */
orderApp.post('*', async (request: Request, response: Response) => {
    try {


        const parameters: CreateOrderParameters = {
            depositSymbol: request.body.depositSymbol,
            depostiAmount: request.body.depositAmount,
            refundAddress: request.body.refundAddress,
            receiveSymbol: request.body.receiveSymbol,
            receiveAmount: request.body.receiveAmount,
            receiveAddress: request.body.receiveAddress,
        }

        const rawResponse: SWFTResponse<SWFTOrderDetails> = await createOrder(parameters)

        const order = parseSWFTOrderDetails(rawResponse)
        response.json(order)

        saveOrder(order, rawResponse, true)
            .catch(error => {
                console.log(`error setting db record of unknown order ${order.id}: ${error.message}`)
            })

    } catch (error) {
        console.error(error)
        response.status(500).send(error.message)
    }
})

async function saveOrder(order: OrderDetails, swftOrder: SWFTResponse<SWFTOrderDetails>, failOnExist = false, id: string = order.id) {

    const orderRef = firestore().collection('order').doc(id)
    const snapshot = await orderRef.get();

    if (snapshot.exists) {
        if (failOnExist) throw Error('Order already exists on database')
        return orderRef.update({
            touched: firestore.FieldValue.serverTimestamp(),
            latestResponse: swftOrder,
            order
        });
    }
    else {
        return orderRef.set({
            order,
            createResponse: swftOrder,
            created: firestore.FieldValue.serverTimestamp()
        });
    }

}

function parseSWFTOrderDetails(rawResponse: SWFTResponse<SWFTOrderDetails>): OrderDetails {
    const date = rawResponse.data.createTime ? new Date(rawResponse.data.createTime) : new Date()
    return {
        id: rawResponse.data.orderId,
        status: rawResponse.data.detailState,
        created: date.toISOString(),
        deposit: {
            address: rawResponse.data.platformAddr,
            amount: parseFloat(rawResponse.data.depositCoinAmt),
            fee: parseFloat(rawResponse.data.depositCoinFeeAmt),
            feeRate: parseFloat(rawResponse.data.depositCoinFeeRate),
            status: rawResponse.data.depositCoinState,
            symbol: rawResponse.data.depositCoinCode,
        },
        receive: {
            address: rawResponse.data.destinationAddr,
            amount: parseFloat(rawResponse.data.receiveCoinAmt),
            symbol: rawResponse.data.receiveCoinCode,
            txid: rawResponse.data.transactionId,
        },
        refund: {
            address: rawResponse.data.refundAddr,
            ...(rawResponse.data.refundCoinAmt !== "" && { amount: parseFloat(rawResponse.data.refundCoinAmt) }),
            ...(rawResponse.data.refundCoinMinerFee !== "" && { fee: parseFloat(rawResponse.data.refundCoinMinerFee) }),
            ...(rawResponse.data.refundDepositTxid !== "" && { txid: (rawResponse.data.refundDepositTxid) }),
        },
    }
}