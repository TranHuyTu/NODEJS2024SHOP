'use strict';

const express = require('express');
const checkoutController = require('../../controllers/checkout.controller')
const { asyncHandler } = require('../../auth/checkAuth');
const { authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

router.use(authenticationV2);

router.post('/user/:id', asyncHandler(checkoutController.getOrderByUser));
router.post('/shop/:id', asyncHandler(checkoutController.getOrderByShop));
router.post('/order/:id', asyncHandler(checkoutController.getOneOrderByUser));
router.post('/order/cancel/:id', asyncHandler(checkoutController.cancelOrderByUser));
router.patch('/order/edit', asyncHandler(checkoutController.updateOrderStatusByShop));



router.post('/review', asyncHandler(checkoutController.checkoutReview));
router.post('/order', asyncHandler(checkoutController.orderByUser));

module.exports = router