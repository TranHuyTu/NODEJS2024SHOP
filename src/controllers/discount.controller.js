'use strict';

const DiscountService = require('../services/discount.service');
const { SuccessResponse } = require('../core/success.response');

class DiscountController{

    createDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successful Code Generations',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send( res );
    }

    getAllDiscountCodes = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successful Code Found',
            metadata: await DiscountService.getAllDiscountCodeByShop({
                ...req.query,
                shopId: req.user.userId
            })
        }).send( res );
    }

    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successful Code Discount Amount',
            metadata: await DiscountService.getDiscountAmount({
                ...req.body
            })
        }).send( res );
    }

    getAllDiscountCodeWithProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successful Discount Code With Products',
            metadata: await DiscountService.getAllDiscountCodeWithProduct({
                ...req.query
            })
        }).send( res );
    }

}

module.exports = new DiscountController();