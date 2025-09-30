import type { FastifyInstance } from 'fastify'

import { getDailyReceiptInPeriod } from './analytics/get-daily-receipt-in-period'
import { getMonthCanceledOrdersAmount } from './analytics/get-month-canceled-orders-amount'
import { getMonthReceipt } from './analytics/get-month-receipt'
import { getPopularProducts } from './analytics/get-popular-products'
import { authenticateFromLink } from './auth/authenticate-from-link'
import { sendAuthenticationLink } from './auth/send-authentication-link'
import { signOut } from './auth/sign-out'
import { createEvaluation } from './evaluations/create-evaluation'
import { getEvaluations } from './evaluations/get-evaluations'
import { approveOrder } from './orders/approve-order'
import { cancelOrder } from './orders/cancel-order'
import { createOrder } from './orders/create-order'
import { deliverOrder } from './orders/deliver-order'
import { dispatchOrder } from './orders/dispatch-order'
import { getDayOrdersAmount } from './orders/get-day-orders-amount'
import { getMonthOrdersAmount } from './orders/get-month-orders-amount'
import { getOrders } from './orders/get-orders'
import { getOrderDetails } from './orders/get-orders-details'
import { getProfile } from './profile/get-profile'
import { updateProfile } from './profile/update-profile'
import { getManagedRestaurant } from './restaurants/get-managed-restaurant'
import { registerRestaurant } from './restaurants/register-restaurant'

export default async function (app: FastifyInstance) {
  await app.register(getDailyReceiptInPeriod)
  await app.register(getMonthCanceledOrdersAmount)
  await app.register(getMonthReceipt)
  await app.register(getPopularProducts)

  await app.register(authenticateFromLink)
  await app.register(sendAuthenticationLink)
  await app.register(signOut)

  await app.register(createEvaluation)
  await app.register(getEvaluations)

  await app.register(approveOrder)
  await app.register(cancelOrder)
  await app.register(createOrder)
  await app.register(deliverOrder)
  await app.register(dispatchOrder)
  await app.register(getDayOrdersAmount)
  await app.register(getMonthOrdersAmount)
  await app.register(getOrderDetails)
  await app.register(getOrders)

  await app.register(getProfile)
  await app.register(updateProfile)

  await app.register(getManagedRestaurant)
  await app.register(registerRestaurant)
}
