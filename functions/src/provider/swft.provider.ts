import { SWFTResponse, SWFTOrderDetails, SWFTPairDefinition, SWFTRate } from "../interfaces/swft.interfaces";
import { post } from 'superagent'
import { SWFT_URL, SWFT_SOURCE_FLAG } from "../config/swft.config";
import uuidv4 = require('uuid/v4');

export interface CreateOrderParameters {
    depositSymbol: string
    depostiAmount: number
    refundAddress: string
    receiveSymbol: string
    receiveAmount: number
    receiveAddress: string
}

export async function getRate (depositSymbol: string, receiveSymbol: string): Promise<SWFTResponse<SWFTRate>> {
    const rawResponse = await post(SWFT_URL + '/api/v1/getBaseInfo')
        .set('Content-Type', 'application/json')
        .send({ depositCoinCode: depositSymbol, receiveCoinCode: receiveSymbol })
    const result = JSON.parse(rawResponse.text)
    evaluateSWFTResponse(result.resCode)
    return result;
}

export async function getPairs (): Promise<SWFTResponse<SWFTPairDefinition[]>> {
    const rawResponse = await post(SWFT_URL + '/api/v1/queryCoinList')
        .set('Content-Type', 'application/json');
    const result = JSON.parse(rawResponse.text)
    evaluateSWFTResponse(result.resCode)
    return result;
}
export async function getOrderState (id: string): Promise<SWFTResponse<SWFTOrderDetails>> {
    const rawResponse = await post(SWFT_URL + '/api/v2/queryOrderState')
        .set('Content-Type', 'application/json')
        .send({
            equipmentNo: "mvs_wallet",
            sourceType: 'H5',
            orderId: id,
        });
    const result = JSON.parse(rawResponse.text)
    evaluateSWFTResponse(result.resCode)
    return result;
}

export async function createOrder (parameters: CreateOrderParameters): Promise<SWFTResponse<SWFTOrderDetails>> {
    const rawResponse = await post(SWFT_URL + '/api/v2/accountExchange')
        .set('Content-Type', 'application/json')
        .send({
            equipmentNo: 'mvs_wallet',
            sessionUuid: '',
            sourceType: 'H5',
            userNo: '',
            orderId: uuidv4(),
            depositCoinCode: parameters.depositSymbol,
            receiveCoinCode: parameters.receiveSymbol,
            depositCoinAmt: parameters.depostiAmount,
            receiveCoinAmt: parameters.receiveAmount,
            receiveSwftAmt: '0',
            destinationAddr: parameters.receiveAddress,
            refundAddr: parameters.refundAddress,
            sourceFlag: SWFT_SOURCE_FLAG,
            developerId: '',
        });
    const result = JSON.parse(rawResponse.text)
    evaluateSWFTResponse(result.resCode)
    return result;
}

export function evaluateSWFTResponse (code: string|number, throwOnError=true) {
    const swftCode = typeof code === 'string' ? parseInt(code) : code
    const codes: {[code: number]: string} = {
        800: "OK",
        900: "internal server error",
        901: "missing required parameters",
        902: "system starting…",
        903: "authentication fail",
        904: "message decode fail",
        905: "message processing fail",
        906: "system exception",
        907: "missing required parameters",
        908: "sending message fail",
        909: "check sign fail",
        910: "receive success",
        911: "system fail",
        912: "order not found",
        913: "deposit coin not exist",
        914: "receive coin not exist",
        915: "deposit coin and receive coin can not be the same",
        916: "target address not legal",
        917: "refund address not legal",
        918: "target address and refund address can not be the same",
        919: "deposit coin amount is not legal",
        920: "receive coin amount not legal",
        921: "deposit coin amount not in legal range",
        922: "do not accept terms",
        923: "SWFTC address not legal",
        924: "transfer method does not exist",
        950: "username/password is wrong",
        951: "not logged in",
        952: "withdraw fail！Your withdraw interval is ：[0.006,0.008]",
        953: "wallet address not exist",
        954: "withdraw amount not legal",
        955: "user initialization fail",
        956: "account has registerd",
        957: "phone/mail not legal",
        958: "password is too simple",
        959: "password is not consistent",
        962: "origin password is wrong",
        963: "email format error",
        964: "username does not exist",
        965: "timeout, please retry",
        966: "sign does not exist",
        967: "language code not exist",
        968: "withdraw fail！Please verify that you account has avaliableAmount CODE",
        969: "send verification code fail",
        970: "phone format error",
        971: "verification code outdated",
        972: "operation too frequent, retry later",
        973: "withdraw address should not be your account address",
        974: "coin was added before",
        975: "result not found",
        976: "remark is too long (over 20 chars)",
        977: "exceeded daily request verification limit, time out limit",
        978: "platform source non-existent",
        979: "password error",
        980: "SMS verification error",
        981: "email verification error",
        982: "email unlinked, please first link email",
        983: "verification code type doesn't exist",
        984: "verification code error",
        985: "email already linked to another account",
        986: "phone number already linked to another account",
        987: "login unsuccessful, login attempts exceeded limit",
        988: "exceeded daily password change limit",
        989: "account already linked, please contact customer service",
        990: "account already linked to google authentification",
        991: "please first link google authenticator",
        992: "GA password error",
        993: "touch ID not enabled",
    }
    if(swftCode!==800 && throwOnError) throw Error(codes[swftCode])
    return codes[swftCode]
}