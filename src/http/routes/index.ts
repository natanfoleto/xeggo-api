// apps/api/src/http/routes/index.ts
import type { FastifyInstance } from 'fastify'

import { approveOrder } from './approve-order'
import { authenticateFromLink } from './authenticate-from-link'
import { cancelOrder } from './cancel-order'
import { createEvaluation } from './create-evaluation'
import { createOrder } from './create-order'
import { deliverOrder } from './deliver-order'
import { dispatchOrder } from './dispatch-order'
import { getDailyReceiptInPeriod } from './get-daily-receipt-in-period'
import { getDayOrdersAmount } from './get-day-orders-amount'
import { getEvaluations } from './get-evaluations'
import { getManagedRestaurant } from './get-managed-restaurant'
import { getMonthCanceledOrdersAmount } from './get-month-canceled-orders-amount'
import { getMonthOrdersAmount } from './get-month-orders-amount'
import { getMonthReceipt } from './get-month-receipt'
import { getOrders } from './get-orders'
import { getOrderDetails } from './get-orders-details'
import { getPopularProducts } from './get-popular-products'
import { getProfile } from './get-profile'
import { registerRestaurant } from './register-restaurant'
import { sendAuthenticationLink } from './send-authentication-link'
import { signOut } from './sign-out'
import { updateProfile } from './update-profile'

export default async function (app: FastifyInstance) {
  await app.register(sendAuthenticationLink)
  await app.register(authenticateFromLink)
  await app.register(getManagedRestaurant)
  await app.register(getMonthReceipt)
  await app.register(getMonthCanceledOrdersAmount)
  await app.register(getDailyReceiptInPeriod)
  await app.register(getProfile)
  await app.register(getOrderDetails)
  await app.register(updateProfile)
  await app.register(registerRestaurant)
  await app.register(createOrder)
  await app.register(getOrders)
  await app.register(approveOrder)
  await app.register(dispatchOrder)
  await app.register(deliverOrder)
  await app.register(cancelOrder)
  await app.register(getDayOrdersAmount)
  await app.register(getMonthOrdersAmount)
  await app.register(getPopularProducts)
  await app.register(createEvaluation)
  await app.register(getEvaluations)
  await app.register(signOut)
}
