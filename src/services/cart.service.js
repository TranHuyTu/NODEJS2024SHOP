"use strict";

const { 
    BadRequestError,
    NotFoundError
} = require('../core/error.response');
const { cart } = require("../models/cart.model");
const {
    getProductById,
    getProductByProductId
} = require("../models/repositories/product.repo");
const { convertToObjectIdMongodb } = require('../utils');
/**
 * Key features: Cart Service
 * -add product to cart
 * -reduce product quantity by one [User]
 * -increase product quantity by one [User]
 * -get cart [User]
 * -Delete cart [User]
 * -Delete item in cart [User]
 */

class CartService {
    /// START REPO CART ///
    static async createUserCart({ userId, product }){
        const query = {cart_userId: userId, cart_state: 'active' },
        updateOrInsert = {
            $addToSet: {
                cart_products: product
            } 
        }, options = { upsert: true, new: true};

        return await cart.findOneAndUpdate( query, updateOrInsert, options );  
    }

    static async updateUserCartQuantity({ userId, product }){
        const { productId, quantity, productType} = product;
        const query = {
            cart_userId: userId,
            'cart_products.productId': productId,
            cart_state: 'active' 
        },
        updateSet = {
            $inc: {
                'cart_products.$.quantity': quantity,
            },
            $set:{
                'cart_products.$.productType': productType,
            } 
        }, options = { upsert: true, new: true};

        return await cart.findOneAndUpdate( query, updateSet, options );  
    }

    static async updateUserCart({ userId, product }){
        const { productId, quantity, productType} = product;
        const query = {
            cart_userId: userId,
            'cart_products.productId': productId,
            cart_state: 'active' 
        },
        updateSet = {
            $set:{
                'cart_products.$.quantity': quantity,
                'cart_products.$.productType': productType,
            } 
        }, options = { upsert: true, new: true};

        return await cart.findOneAndUpdate( query, updateSet, options );  
    }

    /// END REPO CART ///
    static async addToCart({ userId, product = {} }){
        console.log(userId, product)
        userId = parseInt(userId, 10);
        product.productId = parseInt(product.productId, 10);
        product.quantity = parseInt(product.quantity, 10);
        product.price = parseInt(product.price, 10);

        const userCart = await cart.findOne({ cart_userId: userId });
        if(!userCart) return await CartService.createUserCart({ userId, product });

        //nếu có giỏ hàng rồi nhưng chua có sản phẩm
        const checkUserCart = userCart.cart_products.some( pro => pro.productId == product.productId);
        if(!checkUserCart){
            userCart.cart_count_product+=1;
            userCart.cart_products = [...userCart.cart_products, product];
            return await userCart.save();
        }

        //nếu giỏ hàng tồn tại và có sản phẩm đó rồi
        return await CartService.updateUserCart({ userId, product })
    }

    //update cart
    /*
     * shop_order_ids: [
     *  {
     *      shopId,
     *      item_products:[
     *          {
     *              quantity,
     *              price,
     *              shopId,
     *              old_quantity,
     *              productId
     *          }
     *      ],
     *      version,
     *  }
     * ] 
     */ 
    static async addToCartV2({ userId, shop_order_ids = {} }){
        const {
            productId,
            quantity,
            old_quantity,
            productType
        } = shop_order_ids[0]?.item_products[0];

        const foundProduct = await getProductByProductId(productId);

        if(!foundProduct) throw new NotFoundError("Product not exist");

        if(foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId){
            throw new NotFoundError("Product not exist");
        }

        if(quantity === 0 ){
            CartService.deleteUserCart(userId, productId);
        }

        return await CartService.updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity,
                productType
            }
        })
    }

    static async deleteUserCart({userId, productId}){
        const userCart = await cart.findOne({ cart_userId: userId });
        userCart.cart_count_product-=1;

        const query = { cart_userId: userId, cart_state: 'active' };
        const updateSet = {
            $set:{
                cart_count_product: userCart.cart_count_product
            },
            $pull: {
                cart_products: {
                    productId
                }
            }
        }

        const deleteCart = await cart.updateOne( query, updateSet ); 

        return deleteCart;
    }

    static async getListUserCart({ userId }){
        return await cart.findOne({ 
            cart_userId: userId 
        }).lean();
    }
}

module.exports = CartService;
