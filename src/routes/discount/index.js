'use strict';

const express = require('express');
const discountController = require('../../controllers/discount.controller')
const { asyncHandler } = require('../../auth/checkAuth');
const { authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

router.get('/list_product_code', asyncHandler(discountController.getAllDiscountCodeWithProducts));
router.get('/list_product', asyncHandler(discountController.getAllDiscountCodeByProductId));

// authentication //
router.use(authenticationV2);

router.post('', asyncHandler(discountController.createDiscountCode));
router.get('', asyncHandler(discountController.getAllDiscountCodes));
router.get('/discount', asyncHandler(discountController.getDiscountCodeByCode));
router.get('/byShop', asyncHandler(discountController.getAllDiscountCodeUserByShop));
router.get('/byUser', asyncHandler(discountController.getAllDiscountCodeByUserId));
router.post('/amount', asyncHandler(discountController.getDiscountAmount));
router.post('/applyDiscount', asyncHandler(discountController.addDiscount));
router.post('/update', asyncHandler(discountController.updateDiscountCodeAmount));
router.post('/cancel', asyncHandler(discountController.cancelDiscountCode));
router.delete('/delete', asyncHandler(discountController.deleteDiscountCode));

module.exports = router