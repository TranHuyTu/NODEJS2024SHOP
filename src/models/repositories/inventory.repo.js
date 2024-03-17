'use strict';

const { inventory } = require('../inventory.model');
const { Types } = require('mongoose');
const { convertToObjectIdMongodb } = require('../../utils')

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

const reservationInventory = async ({ productId, quantity, cardId })=>{
    const query = {
        inven_productId: convertToObjectIdMongodb(productId),
        inven_stock: { $gte: quantity }
    }, updateSet = {
        $inc: {
            inven_stock: -quantity
        },
        $push: {
            inven_reservation: {
                quantity,
                cardId,
                createOn: new Date()
            }
        }
    }, options = { upsert: true, new: true};

    return await inventory.updateOne(query, updateSet, options)
}

module.exports = {
    insertInventory,
    reservationInventory
}