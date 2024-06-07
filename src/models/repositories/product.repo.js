'use strict';

const { product, clothing, electronic, furniture } = require('../../models/product.model');
const { Types } = require('mongoose');
const { getSelectData, unGetSelectData, convertToObjectIdMongodb } = require('../../utils');

const findAllDraftForShop = async ({ query, limit, page })=>{
    return await queryProduct({ query, limit,page});
}

const findAllPublishForShop = async ({ query, limit, page })=>{
    return await queryProduct({ query, limit, page});
}

const searchProductByUser = async ({ keySearch })=>{
    const regexSearch = new RegExp(keySearch);
    const results = await product.find({
        isPublished: true,
        $text: { $search: regexSearch}
    },{score: {$meta: 'textScore'}})
    .sort({score: {$meta: 'textScore'}})
    .lean();

    return results;
}

const publishProductByShop = async({ product_shop, product_id })=>{
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })
    if(!foundShop) return null;

    foundShop.isDraft = false;
    foundShop.isPublished = true;
    const { modifiedCount } = await foundShop.updateOne(foundShop);

    return  modifiedCount;
}

const draftProductByShop = async({ product_shop, product_id })=>{
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })
    if(!foundShop) return null;

    foundShop.isDraft = true;
    foundShop.isPublished = false;
    const { modifiedCount } = await foundShop.updateOne(foundShop);

    return  modifiedCount;
}

const unPublishProductByShop = async({ product_shop, product_id })=>{
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })
    if(!foundShop) return null;

    foundShop.isDraft = true;
    foundShop.isPublished = false;
    const { modifiedCount } = await foundShop.updateOne(foundShop);

    return  modifiedCount;
}

const findAllProducts = async ({ limit, sort, page, filter, select })=>{
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1};
    const products = await product.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();

    return products;
}

const findAllProductsByType = async ({ limit, sort, page, type, select })=>{
    const filter = {
        product_type: type,
        isPublished: true
    }
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1};
    const products = await product.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();

    return products;
}

const findProduct = async ({ product_id, unSelect })=>{
    return await product.findById(product_id)
    .select(unGetSelectData(unSelect));
}

const findProductByProductId = async ({ product_id, unSelect })=>{
    return await product.findOne({product_id: product_id})
    .select(unGetSelectData(unSelect));
}

const  findProductByProductType = async ({ product_type, isPublished, unSelect })=>{
    return await product.find({
        product_type: product_type,
        isPublished: isPublished
    })
    .select(unGetSelectData(unSelect));
}

const  findProductByProductTypeAndShop = async ({ product_type, product_shop, isPublished, unSelect })=>{
    return await product.find({
        product_type: product_type,
        isPublished: isPublished,
        product_shop: convertToObjectIdMongodb(product_shop), 
    })
    .select(unGetSelectData(unSelect));
}

const updateProductById = async ({
    productId,
    bodyUpdate,
    model,
    isNew = true,
})=>{
    return await model.findByIdAndUpdate( productId, bodyUpdate,{
        new: isNew,
    })
}

const queryProduct = async ({ query, limit, page })=>{
    const skip = (page - 1) * limit;
    return await product.find(query).
    populate('product_shop', 'name email -_id').
    sort({ updateAt: -1 }).
    skip(skip).
    limit(limit).
    lean().
    exec();
}

const getProductById = async (productId) => {
    return await product.findOne({_id: convertToObjectIdMongodb(productId)}).lean();
}

const getProductByProductId = async (productId) => {
    return await product.findOne({product_id: productId}).lean();
}

const checkProductByServer = async (products)=>{
    return await Promise.all(products.map( async (product) =>{
        const foundProduct = await getProductByProductId(product.productId);
        if(foundProduct){
            return {
                price: foundProduct.product_discounted_price,
                quantity: parseInt(product.quantity),
                productId: product.productId,
                productType: product.productType
            }
        }
    }))
}

const reservationInventory = async ({ productId, quantity, shopId })=>{
    const product = await getProductByProductId(productId);

    const query = {
        inven_productId: convertToObjectIdMongodb(product._id),
        inven_shopId: convertToObjectIdMongodb(shopId),
        inven_stock: { $gte: quantity }
    }, updateSet = {
        $inc: {
            inven_stock: -quantity
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

// const searchProductsSimilar = async ({product_category})=>{
//     return await product.aggregate([
//     {
//         $search: {
//         index: "default",  // Tên của chỉ mục tìm kiếm (thường là "default")
//         text: {
//             query: product_category,
//             path: "product_category"
//         }
//         }
//     },
//     {
//         $limit: 5
//     }
//     ]);
// }

module.exports = {
    findAllDraftForShop,
    publishProductByShop,
    findAllPublishForShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById,
    getProductById,
    checkProductByServer,
    getProductByProductId,
    findProductByProductId,
    findProductByProductType,
    findProductByProductTypeAndShop,
    findAllProductsByType,
    draftProductByShop
}