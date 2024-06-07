'use strict';

const CheckoutService = require('../services/checkout.service');

const { CREATE, OK, SuccessResponse } = require('../core/success.response');

class CheckoutController{
    checkoutReview = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Create new cart successfully',
            metadata: await CheckoutService.checkoutReview(req.body)
        }).send(res);
    }
    orderByUser = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Create new cart successfully',
            metadata: await CheckoutService.orderByUser(req.body)
        }).send(res);
    }
    getOrderByUser = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Get order successfully',
            metadata: await CheckoutService.getOrderByUser({userId: req.params.id})
        }).send(res);
    }
    getOneOrderByUser = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Get order by user successfully',
            metadata: await CheckoutService.getOneOrderByUser({ orderId: req.params.id })
        }).send(res);
    }

    getOrderByShop = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Get order successfully',
            metadata: await CheckoutService.getOrderByShop({shopId: req.params.id})
        }).send(res);
    }
    cancelOrderByUser = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Cancel order successfully',
            metadata: await CheckoutService.cancelOrderByUser({
                orderId: req.params.id, 
                refreshToken: req.headers['x-rtoken-id'],
                user: req.user,
                keyStore: req.keyStore
            })
        }).send(res);
    }
    updateOrderStatusByShop = async (req, res, next) =>{
        new SuccessResponse({
            message: 'update order status successfully',
            metadata: await CheckoutService.updateOrderStatusByShop(req.body)
        }).send(res);
    }
}

module.exports = new CheckoutController