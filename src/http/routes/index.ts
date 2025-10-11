import type { FastifyInstance } from 'fastify'

import { getDailyReceiptInPeriod } from './analytics/get-daily-receipt-in-period'
import { getMonthCanceledOrdersAmount } from './analytics/get-month-canceled-orders-amount'
import { getMonthReceipt } from './analytics/get-month-receipt'
import { getPopularProducts } from './analytics/get-popular-products'
import { authenticateFromLink } from './auth/authenticate-from-link'
import { sendAuthenticationLink } from './auth/send-authentication-link'
import { signOut } from './auth/sign-out'
import { createCategory } from './categories/create-category'
import { deleteCategory } from './categories/delete-category'
import { getCategories } from './categories/get-categories'
import { getCategory } from './categories/get-category'
import { updateCategory } from './categories/update-category'
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
import { createProduct } from './products/create-product'
import { deleteProductImage } from './products/delete-product-image'
import { getProduct } from './products/get-product'
import { getProducts } from './products/get-products'
import { updateProduct } from './products/update-product'
import { updateStatusProduct } from './products/update-status-product'
import { uploadProductImage } from './products/upload-product-image'
import { getProfile } from './profile/get-profile'
import { updateProfile } from './profile/update-profile'
import { deleteRestaurantAvatar } from './restaurants/delete-restaurant-avatar'
import { getManagedRestaurant } from './restaurants/get-managed-restaurant'
import { getOpeningHours } from './restaurants/get-opening-hours'
import { getPaymentMethods } from './restaurants/get-payment-methods'
import { getSegments } from './restaurants/get-segments'
import { registerRestaurant } from './restaurants/register-restaurant'
import { updateOpeningHours } from './restaurants/update-opening-hours'
import { updatePaymentMethods } from './restaurants/update-payment-methods'
import { updateSegments } from './restaurants/update-segments'
import { uploadRestaurantAvatar } from './restaurants/upload-restaurant-avatar'

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

  await app.register(createCategory)
  await app.register(updateCategory)
  await app.register(deleteCategory)
  await app.register(getCategory)
  await app.register(getCategories)

  await app.register(createProduct)
  await app.register(updateProduct)
  await app.register(uploadProductImage)
  await app.register(deleteProductImage)
  await app.register(updateStatusProduct)
  await app.register(getProduct)
  await app.register(getProducts)

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
  await app.register(uploadRestaurantAvatar)
  await app.register(deleteRestaurantAvatar)
  await app.register(getOpeningHours)
  await app.register(updateOpeningHours)
  await app.register(getSegments)
  await app.register(updateSegments)
  await app.register(getPaymentMethods)
  await app.register(updatePaymentMethods)
}
