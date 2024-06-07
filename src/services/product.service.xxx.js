'use strict';

const { product, clothing, electronic, furniture } = require('../models/product.model');
const { BadRequestError } = require('../core/error.response');
const { removeUndefinedObject, updateNestedObjectParser, randomProductId } = require('../utils');
const { 
    findAllDraftForShop, 
    publishProductByShop, 
    findAllPublishForShop, 
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById,
    findProductByProductId,
    findProductByProductType,
    findProductByProductTypeAndShop,
    findAllProductsByType
} = require('../models/repositories/product.repo');
const { insertInventory } = require('../models/repositories/inventory.repo');
const { pushNotiToSystem } = require('./notification.service');

//define Factory class to create product
class ProductFactory{
    static productRegistry = {};

    static registerProductType( type, classRef ){
        ProductFactory.productRegistry[type] = classRef;
    }

    static async createProduct(type, payload){    

        const productClass = ProductFactory.productRegistry[type];
        if(!productClass) throw new BadRequestError(`Invalid Product Types ${type}`);

        return new productClass( payload ).createProduct();
    }

    static async updateProduct(type, productId, payload){    

        const productClass = ProductFactory.productRegistry[type];
        if(!productClass) throw new BadRequestError(`Invalid Product Types ${type}`);

        return new productClass( payload ).updateProduct(productId);
    }

    //PUT
    static async publishProductByShop({ product_shop, product_id }){
        return await publishProductByShop({ product_shop, product_id });
    }

    static async draftProductByShop({ product_shop, product_id }){
        return await draftProductByShop({ product_shop, product_id });
    }

    static async unPublishProductByShop({ product_shop, product_id }){
        return await unPublishProductByShop({ product_shop, product_id });
    }
    //END PUT

    //QUERY
    static async findAllDraftForShop({ product_shop, limit = 60, page = 1}){
        const query = { product_shop , isDraft:true };
        return await findAllDraftForShop({ query, limit, page });
    }

    static async findAllDraftForShopByType({ product_shop, limit = 60, page = 1, type = "Electronics"}){
        const query = { product_shop , product_type: type, isDraft:true };
        return await findAllDraftForShop({ query, limit, page });
    }

    static async findAllPublishForShop({ product_shop, limit = 60, page = 1}){
        const query = { product_shop , isPublished :true };
        return await findAllPublishForShop({ query, limit, page });
    }

    static async findAllPublishForShopByType({ product_shop, limit = 60, page = 1, type = "Electronics"}){
        const query = { product_shop , isPublished :true, product_type: type, };
        return await findAllPublishForShop({ query, limit, page});
    }

    static async searchProducts({ keySearch }){
        return await searchProductByUser({ keySearch});
    }

    static async findAllProducts({ limit = 60, sort = 'ctime', page = 1, filter = { isPublished: true }}){
        return await findAllProducts({ limit, sort, page, filter, 
            select: ['_id', 'product_id','product_name','product_quantity', 'product_description', 'product_price', 'product_discounted_price','product_type', 'product_category', 'product_variation' ,'product_thumb', 'product_shop', 'product_ratingAverage', 'img_link']
         });
    }

    static async findAllProductsByType({ limit = 60, sort = 'ctime', page = 1, type = "Electronics"}){
        return await findAllProductsByType({ limit, sort, page, type, 
            select: ['_id', 'product_id','product_name','product_quantity', 'product_description', 'product_price', 'product_discounted_price','product_type', 'product_category', 'product_variation' ,'product_thumb', 'product_shop', 'product_ratingAverage', 'img_link']
         });
    }

    static async findProduct({ product_id }){
        return await findProduct({ product_id, unSelect: ['__v']});
    }

    static async findProductByProductId({ product_id }){
        return await findProductByProductId({ product_id, unSelect: ['__v']});
    }
    
    static async findProductByProductType({ product_type, isPublished }){
        return await findProductByProductType({ product_type, isPublished, unSelect: ['__v']});
    }
    
    static async findProductByProductTypeAndShop({ product_type, product_shop, isPublished }){
        return await findProductByProductTypeAndShop({product_type, product_shop, isPublished, unSelect: ['__v']});
    }
    //END QUERY
}

class Product{

    constructor({ 
        product_name, product_thumb, product_description, product_price, 
        product_quantity, product_type, product_shop, product_attributes,img_link, product_variation
    }){
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_quantity = product_quantity;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
        this.img_link = img_link;
        this.product_variation = product_variation;
    }

    async createProduct(product_id){ 
        const newProduct = await product.create({
            ...this,
            _id: product_id,
            product_id: randomProductId()
        });
        
        const totalQuantity = this.product_quantity.reduce((acc, product) => acc + product.quantity, 0);

        if(newProduct){
            await insertInventory({
                productId: newProduct._id,
                shopId: this.product_shop,
                stock: totalQuantity
            })
        }

        // Push thong bao

        return newProduct;
    }

    async updateProduct( productId, bodyUpdate){
        return await updateProductById({ productId, bodyUpdate, model: product });
    }
}

//Define sub-class for different product types Clothing
class Clothing extends Product{

    async createProduct(){
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop 
        });
        if(!newClothing) throw new BadRequestError('create new clothing error');

        const newProduct = await super.createProduct(newClothing._id);
        if(!newProduct) throw new BadRequestError('create new Product error');

        return newProduct;
    }

    async updateProduct( productId ){
        //1. remove attributes has null undefined
        const objectParams = removeUndefinedObject(this);
        //2. check xem update ở chỗ nào ?
        if(objectParams.product_attributes){
            await updateProductById({ 
                productId, 
                bodyUpdate: updateNestedObjectParser( objectParams.product_attributes), 
                model: clothing
            })
        }
        const updateProduct = await super.updateProduct(
            productId, 
            updateNestedObjectParser( objectParams)
            );

        return updateProduct;
    }
}

//Define sub-class for different product types Electronics
class Electronics extends Product{

    async createProduct(){
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop 
        });
        if(!newElectronic) throw new BadRequestError('create new Electronics error');

        const newProduct = await super.createProduct(newElectronic._id);
        if(!newProduct) throw new BadRequestError('create new Product error');

        return newProduct;
    }
}

//Define sub-class for different product types Furniture
class Furniture extends Product{

    async createProduct(){
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop 
        });
        if(!newFurniture) throw new BadRequestError('create new Electronics error');

        const newProduct = await super.createProduct(newFurniture._id);
        if(!newProduct) throw new BadRequestError('create new Product error');

        return newProduct;
    }
}

//registers a new product
ProductFactory.registerProductType('Electronics', Electronics);
ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Furniture', Furniture);

module.exports = ProductFactory;