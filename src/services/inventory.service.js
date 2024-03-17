'use strict';

const { inventory } = require('../models/inventory.model');

const { 
    getProductById
 } = require('../models/repositories/product.repo')

const {
    BadRequestError
} = require('../core/error.response')

class InventoryService{

    static async addStockToInventory({
        stock,
        productId,
        shopId,
        location = '37-73'
    }){
        const product = await getProductById(productId);
        if(product) throw new BadRequestError('The product does not exist!!!');

        const query = { inven_shopId: shopId, inven_productId: productId },
        updateSet = {
            $in: {
                inven_stock: stock,
            },
            $set: {
                inven_location: location
            }
        },
        options = {upsert: true, new: true};

        return await inventory.findOneAndUpdate(query, updateSet, options)
    }
}

module.exports = InventoryService;