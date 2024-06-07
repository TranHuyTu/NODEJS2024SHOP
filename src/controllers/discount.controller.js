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
                ...req.body,
                userId: req.user.userId
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

    getAllDiscountCodeByProductId = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successful Discount Code With Products',
            metadata: await DiscountService.getAllDiscountCodeByProductId({
                ...req.query
            })
        }).send( res );
    }

    deleteDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successful Discount Code With Products',
            metadata: await DiscountService.deleteDiscountCode({
                ...req.body
            })
        }).send( res );
    }

    cancelDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successful Discount Code With Products',
            metadata: await DiscountService.cancelDiscountCode({
                ...req.body,
                userId: req.user.userId
            })
        }).send( res );
    }

    updateDiscountCodeAmount = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successful Discount Code With Products',
            metadata: await DiscountService.updateDiscountCodeAmount({
                ...req.body,
                userId: req.user.userId
            })
        }).send( res );
    }

    addDiscount = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successful Discount Code With Products',
            metadata: await DiscountService.addDiscount({
                ...req.body,
                userId: req.user.userId
            })
        }).send( res );
    }

    getDiscountCodeByCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successful Code Found',
            metadata: await DiscountService.getDiscountCodeByCode({
                ...req.query,
                shopId: req.user.userId
            })
        }).send( res );
    }

    getAllDiscountCodeUserByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successful Code Found',
            metadata: await DiscountService.getAllDiscountCodeUserByShop({
                ...req.query
            })
        }).send( res );
    }

    getAllDiscountCodeByUserId = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successful Code Found',
            metadata: await DiscountService.getAllDiscountCodeByUserId({
                userId: req.user.userId
            })
        }).send( res );
    }

}

module.exports = new DiscountController();