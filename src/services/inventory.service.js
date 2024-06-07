'use strict';

const { inventory } = require('../models/inventory.model');

const { 
    getProductById
 } = require('../models/repositories/product.repo')

const {
    BadRequestError
} = require('../core/error.response');
const { convertToObjectIdMongodb } = require('../utils');

class InventoryService{

    static async addStockToInventory({
        stock,
        productId,
        shopId,
        location = '37-73'
    }){
        const product = await getProductById(productId);
        if(!product) throw new BadRequestError('The product does not exist!!!');

        const query = { inven_shopId: shopId, inven_productId: productId },
        updateSet = {
            $inc: {
                inven_stock: +stock,
            },
            $set: {
                inven_location: location
            }
        },
        options = {upsert: true, new: true};

        return await inventory.findOneAndUpdate(query, updateSet, options)
    }

    static async addProductInventory({
        stock,
        productId,
        shopId,
        location = '37-73'
    }){
        const product = await getProductById(productId);
        if(!product) throw new BadRequestError('The product does not exist!!!');

        return await inventory.create({
            inven_productId: convertToObjectIdMongodb(productId),
            inven_location: location,
            inven_stock: stock,
            inven_shopId: convertToObjectIdMongodb(shopId)
        })
    }
}

module.exports = InventoryService;