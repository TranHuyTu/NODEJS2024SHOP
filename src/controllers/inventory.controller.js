'use strict';

const InventoryService = require('../services/inventory.service');

const { SuccessResponse } = require('../core/success.response');

class InventoryController{
    addStockToInventory = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Create stock to Inventory successfully',
            metadata: await InventoryService.addStockToInventory(req.body)
        }).send(res);
    }

    addProductInventory = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Create Product Inventory successfully',
            metadata: await InventoryService.addProductInventory(req.body)
        }).send(res);
    }
}

module.exports = new InventoryController