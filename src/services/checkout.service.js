'use strict';

const { 
    BadRequestError,
    NotFoundError
} = require('../core/error.response');

const {findCartById} = require('../models/repositories/cart.repo');
const { checkProductByServer } = require('../models/repositories/product.repo');
const { getDiscountAmount } = require('./discount.service');
const { acquireLock, releaseLock } = require('./redis.service');
const { order } = require('../models/order.model');

class CheckoutService{
//login and without login
/*
    {
        cartId,
        userId,
        shop_order_ids:[
            {
                shopId,
                shop_discounts: [],
                item_products: [
                    {
                        price,
                        quantity,
                        productId
                    }
                ],
            },
            {
                shopId,
                shop_discounts: [
                    {
                        shopId,
                        discountId,
                        codeId
                    }
                ],
                item_products: [
                    {
                        price,
                        quantity,
                        productId
                    }
                ],
            },
        ]
    }
*/
    static async checkoutReview({
        cartId, userId, shop_order_ids
    }){
        //check cartId not expired
        const foundCart = await findCartById(cartId);

        if(!foundCart) throw new BadRequestError('Cart does not exist!');

        const checkout_order = {
            totalPrice: 0,  // tong tiền hàng
            freeShip: 0,    // phí vận chuyển
            totalDiscount: 0,   //tổng tiền discount giảm giá   
            totalCheckout: 0    //tổng thanh toán
        }, shop_order_ids_new = [];

        for(let i = 0; i < shop_order_ids.length; i++) {
            const { shopId, shop_discounts = [], item_products = [] } = shop_order_ids[i];

            const checkProductServer = await checkProductByServer(item_products);
            console.log(`CheckProductServer ::`, checkProductServer);

            if(!checkProductServer[0]) throw new BadRequestError('oder wrong !!!');

            //tong tien don hang
            const checkoutPrice = checkProductServer.reduce((acc, product) =>{
                return acc + (product.quantity * product.price)
            },0);
            
            checkout_order.totalPrice =+ checkoutPrice;

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice,    //tính trước khi giảm giá
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductByServer
            }

            if(shop_discounts.length > 0){
                //gia su chi có 1 discount
                const {totalPrice = 0, discount = 0} = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer
                })

                checkout_order.totalDiscount += discount

                if(discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount;
                }
            }
            
            // Tong thanh toan cuoi cung
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
            shop_order_ids_new.push(itemCheckout);

            return {
                shop_order_ids,
                shop_order_ids_new,
                checkout_order
            }
        }
    }

    //order

    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {}
    }){
        const { shop_order_ids_new, checkout_order } = await CheckoutService.checkoutReview({
            cartId,
            userId,
            shop_order_ids
        })

        //check lai 1 lan nua xem co vuot ton kho hay khong
        //get new array Product
        const products = shop_order_ids_new.flatMap( order => order.item_products );
        console.log(`[1]`, products);
        const acquireProduct = [];
        for ( let i = 0; i < products.length; i++ ) {
            const { productId, quantity } = products[ i ];
            const keyLock = await acquireLock(productId, quantity, cartId);
            acquireProduct.push( keyLock ? true : false );
            if(keyLock){
                await releaseLock(keyLock);
            }
        }

        //check neu co 1 san pham het hang trong kho
        if(acquireProduct.includes(false)){
            throw new BadRequestError('Mot so san pham da duoc cap nhat, vui long quay lai gio hang ... ');
        }

        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new
        });

        //truong hop them thanh cong remove product in cart
        if(newOrder){
            
        }

        return newOrder;
    }

    /*
        1> Query Orders[User]
     */
    static async getOrderByUser(){

    }
    /*
        2> Query Orders Using Id[User]
     */
    static async getOneOrderByUser(){

    }
    /*
        3> Cancel Orders[User]
     */
    static async cancelOrderByUser(){

    }
    /*
        4> Update Orders Status [Shop| Admin]
     */
    static async updateOrderStatusByShop(){

    }
}

module.exports = CheckoutService;