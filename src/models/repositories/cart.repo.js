'use strict';

const { convertToObjectIdMongodb } = require('../../utils');
const {cart} = require('../cart.model');


const findCartById = async (cartId)=>{
    return await cart.findOne({_id: convertToObjectIdMongodb(cartId), cart_state: 'active'}).lean();
}

const removeProductByCart = async ({ cartId, product })=>{
        const { product_id } = product;
        
        return await cart.findByIdAndUpdate(
            cartId,
            { $pull: { "cart_products": { "productId": product_id } } },
            { upsert: true, new: true}
        )
    }

module.exports = {
    findCartById,
    removeProductByCart
}