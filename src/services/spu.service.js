'use strict';

const { findShopById } = require("../models/repositories/shop.repo");
const SPU_MODEL = require('../models/spu.model');
const { NotFoundError } = require('../core/error.response')
const { randomProductId, convertToObjectIdMongodb } = require('../utils');
const { newSku } = require("./sku.service");

const newSpu = async({
    product_name,
    product_thumb,
    product_description,
    product_slug,
    product_price,
    product_category,
    product_shop,
    product_attributes,
    product_quantity,
    product_variations,
    sku_list = []
})=>{
    try {
        const foundShop = await findShopById({
            shop_id: product_shop
        })

        if (!foundShop) throw new NotFoundError('Shop not found');

        //2. create a new SPU
        const spu = await SPU_MODEL.create({
            product_id: randomProductId(),
            product_name,
            product_thumb,
            product_description,
            product_slug,
            product_price,
            product_category,
            product_shop: convertToObjectIdMongodb(product_shop),
            product_attributes,
            product_quantity,
            product_variations
        })

        //3. get spu_id add to sku_service
        if(spu && sku_list.length){
            newSku({
                sku_list, 
                spu_id: spu.product_id
            }).then()
        }

        //4. async data via alasticsearch 

        //5. respond result object
        return !!spu;
    } catch (error) {
        
    }
}

module.exports = {
    newSpu
}