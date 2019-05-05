import { keyBy } from 'lodash'
import express = require('express')
import { SWFTResponse, SWFTPairDefinition } from '../interfaces/swft.interfaces';
import { Pairs } from '../interfaces/output.interfaces';
import { getPairs } from '../provider/swft.provider';

export const pairsApp = express()

interface PairDefinitions { [index: string]: SWFTPairDefinition }

/**
 * @api {get} /pairs Load available pairs
 * @apiName GetPairs
 * @apiGroup Pairs
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "ETP": [
 *              "BTC",
 *              "ETH",
 *              "EOS",
 *              "LTC",
 *              "ETC"
 *          ],
 *          "BTC": [
 *              "ETP"
 *          ],
 *          "ETH": [
 *              "ETP"
 *          ],
 *          "BCH": [
 *              "ETP"
 *          ],
 *          "XRP": [
 *              "ETP"
 *          ],
 *          "EOS": [
 *              "ETP"
 *          ],
 *          "LTC": [
 *              "ETP"
 *          ],
 *          "XMR": [
 *              "ETP"
 *          ],
 *          "ETC": [
 *              "ETP"
 *          ]
 *      }
 */
pairsApp.get('*', async (request: express.Request, response: express.Response) => {
    try {

        const enforcelist = ['ETP'] //Pair must contain at least one asset from this list
        const whitelist = ['ETP', 'BTC', 'ETH', 'BCH', 'XRP', 'EOS', 'LTC', 'XMR', 'ETC']

        const pairs: Pairs = {}

        const rawResponse: SWFTResponse<SWFTPairDefinition[]> = await getPairs()

        const swftDefinitions: PairDefinitions = keyBy(rawResponse.data, 'coinCode')
        whitelist.forEach(fromSymbol => {
            if (swftDefinitions[fromSymbol] !== undefined) {
                const blacklist: string[] = swftDefinitions[fromSymbol].noSupportCoin.split(',')
                const tradable: string[] = []
                if (enforcelist.indexOf(fromSymbol) !== -1) {
                    whitelist.forEach(toSymbol => {
                        if (toSymbol !== fromSymbol &&
                            blacklist.indexOf(toSymbol) === -1 &&
                            swftDefinitions[toSymbol] !== undefined &&
                            swftDefinitions[toSymbol].isSupportAdvanced === 'Y'
                        ) {
                            tradable.push(toSymbol)
                        }
                    })
                } else {
                    enforcelist.forEach(toSymbol => {
                        if (blacklist.indexOf(toSymbol) !== undefined) {
                            tradable.push(toSymbol)
                        }
                    })
                }

                if (tradable.length > 0) {
                    pairs[fromSymbol] = tradable
                }
            }
        })
        response.json(pairs)
    } catch (error) {
        console.error(error)
        response.status(500).send(error.message)
    }
})
