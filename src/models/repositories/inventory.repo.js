'use strict';

const { inventory } = require('../inventory.model');
const { Types } = require('mongoose');
const { convertToObjectIdMongodb } = require('../../utils');
const { getProductByProductId } = require('./product.repo');
const { NotFoundError } = require('../../core/error.response');

const insertInventory = async({
    productId, shopId, stock, location = 'inKnown'
}) => {
    return await inventory.create({
        inven_productId: productId,
        inven_stock: stock,
        inven_location: location,
        inven_shopId: shopId
    })
}

const reservationInventory = async ({ productId, quantity, cardId, shopId })=>{
    const product = await getProductByProductId(productId);

    const query = {
        inven_productId: convertToObjectIdMongodb(product._id),
        inven_shopId: convertToObjectIdMongodb(shopId),
        inven_stock: { $gte: quantity }
    }, updateSet = {
        $inc: {
            inven_stock: -quantity
        },
        $push: {
            inven_reservations: {
                quantity,
                cardId,
                createOn: new Date()
            }
        }
    }, options = { upsert: true, new: true};

    return await inventory.updateOne(query, updateSet, options)
}

const rollbackInventory = async ({ productId, quantity, shopId })=>{
    const product = await getProductByProductId(productId);

    const query = {
        inven_productId: convertToObjectIdMongodb(product._id),
        inven_shopId: convertToObjectIdMongodb(shopId),
        inven_stock: { $gte: quantity }
    }, updateSet = {
        $inc: {
            inven_stock: +quantity
        },
    }, options = { upsert: true, new: true};

    return await inventory.updateOne(query, updateSet, options)
}

const checkInventory = async ({productId, shopId, quantity}) => {
    const inven = await inventory.findOne({
        inven_productId: convertToObjectIdMongodb(productId),
        inven_shopId: convertToObjectIdMongodb(shopId)
    })

    if(!inven) {
        throw new NotFoundError('Inventory not found Product')
    }

    if(inven.inven_stock < quantity) return false

    return true
}

module.exports = {
    insertInventory,
    reservationInventory,
    checkInventory,
    rollbackInventory
}