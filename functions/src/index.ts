import { https } from 'firebase-functions'

import { rateApp } from './controller/rate'
import { pairsApp } from './controller/pairs';
import { orderApp } from './controller/order';

export const rate = https.onRequest(rateApp);
export const pairs = https.onRequest(pairsApp);
export const order = https.onRequest(orderApp);
