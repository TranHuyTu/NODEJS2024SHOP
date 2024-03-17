'use strict';

const CartService = require('../services/cart.service');

const { CREATE, OK, SuccessResponse } = require('../core/success.response');

class CartController{
    addToCart = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Create new cart successfully',
            metadata: await CartService.addToCart(req.body)
        }).send(res);
    }

    update = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Update cart successfully',
            metadata: await CartService.addToCartV2(req.body)
        }).send(res);
    }

    delete = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Deleted cart successfully',
            metadata: await CartService.deleteUserCart(req.body)
        }).send(res);
    }

    listCart = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Create new cart successfully',
            metadata: await CartService.getListUserCart(req.query)
        }).send(res);
    }
}

module.exports = new CartController