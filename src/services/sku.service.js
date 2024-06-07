'use strict'

const SKU_MODEL = require('../models/sku.model');
const { randomProductId } = require('../utils');

const newSku = async ({ spu_id, sku_list })=>{
    try {
        const convert_sku_list = sku_list.map( sku => {
            return {
                ...sku,
                product_id: spu_id,
                sku_id: `${spu_id}.${randomProductId()}`
            }
        })
        const skus = await SKU_MODEL.create(convert_sku_list)

        return skus;
    } catch (error) {
        
    }
}

module.exports = {
    newSku
}