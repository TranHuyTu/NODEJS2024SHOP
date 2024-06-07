'use strict';

const { 
    BadRequestError,
    NotFoundError
} = require('../core/error.response');

const {findCartById, removeProductByCart} = require('../models/repositories/cart.repo');
const { checkProductByServer, getProductByProductId } = require('../models/repositories/product.repo');
const { getDiscountAmount, updateDiscountCodeAmount } = require('./discount.service');
const { acquireLock, releaseLock } = require('./redis.service');
const { order } = require('../models/order.model');
const { checkInventory, rollbackInventory } = require('../models/repositories/inventory.repo');
const { convertToObjectIdMongodb } = require('../utils');
const { findUserById } = require('../models/repositories/user.repo');
const { getUserDetailByRefreshToken } = require('./user.service');

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
        cartId, userId, shop_order_ids, shopId
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

            const checkProductServers = await checkProductByServer(item_products);

            if(!checkProductServers[0]) throw new BadRequestError('oder wrong !!!');

            //tong tien don hang
            const checkoutPrice = checkProductServers.reduce((acc, product) =>{
                return acc + (product.quantity * product.price)
            },0);
            
            checkout_order.totalPrice += checkoutPrice;

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice,    //tính trước khi giảm giá
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServers
            }

            if(shop_discounts.length > 0){
                //gia su chi có 1 discount
                const {totalPrice = 0, discount = 0} = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServers
                })

                checkout_order.totalDiscount += discount
                if(discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount;
                }
            }
            
            // Tong thanh toan cuoi cung
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
            shop_order_ids_new.push(itemCheckout);
        }

         return {
                shopId,
                shop_order_ids,
                shop_order_ids_new,
                checkout_order
            }
    }

    //order

    static async orderByUser({
        shopId,
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {}
    }){
        const {shop_order_ids_new, checkout_order } = await CheckoutService.checkoutReview({
            cartId,
            userId,
            shop_order_ids,
            shopId
        })

        for ( let i = 0; i < shop_order_ids_new.length; i++ ) {
            const product = await getProductByProductId(shop_order_ids_new[i].item_products[0].productId);
            
            const inven = await checkInventory({
                productId: product._id,
                shopId: shop_order_ids_new[i].shopId,
                quantity: shop_order_ids_new[i].item_products[0].quantity
            })

            if(!inven) {
                throw new BadRequestError('Sản phẩm này đã hết hàng !!!!!!!!!')
            };
        }
        
        //get new array Product
        const products = shop_order_ids_new.flatMap( order => order.item_products );
        const detailProduct = shop_order_ids_new.flatMap(order =>
            order.item_products.map(product => ({
                shopId: order.shopId,
                productId: product.productId
            }))
        );
        
        const acquireProduct = [];
        for ( let i = 0; i < products.length; i++ ) {
            const { productId, quantity } = products[i];
            const keyLock = await acquireLock(productId, quantity, cartId, detailProduct[i].shopId);
            
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
            // order_shopId: convertToObjectIdMongodb(shopId),
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new
        });

        //truong hop them thanh cong remove product in cart
        if(newOrder){
            for ( let i = 0; i < shop_order_ids_new.length; i++ ) {
                const product = await getProductByProductId(shop_order_ids_new[i].item_products[0].productId);

                await removeProductByCart({cartId: cartId, product});
            }
            let arrayDiscount = [];
                for(let i = 0; i < newOrder.order_products.length; i++) {
                    if(newOrder.order_products[i].shop_discounts.length > 0){
                        if(newOrder.order_products[i].priceRaw > newOrder.order_products[i].priceApplyDiscount) {
                            if(arrayDiscount.length === 0){
                                arrayDiscount.push({
                                    shopId: newOrder.order_products[i].shopId, 
                                    codeId: newOrder.order_products[i].shop_discounts[0].codeId, 
                                    userId 
                                })
                            }else{
                                const foundDiscount = arrayDiscount.filter(discount => discount.shopId === newOrder.order_products[i].shopId && discount.codeId === newOrder.order_products[i].shop_discounts[0].codeId);
                                if(!foundDiscount){
                                    arrayDiscount.push({
                                        shopId: newOrder.order_products[i].shopId, 
                                        codeId: newOrder.order_products[i].shop_discounts[0].codeId, 
                                        userId 
                                    })
                                }
                            }
                            
                        }
                    }

                }
                arrayDiscount.flatMap(async (discount) => {
                    await updateDiscountCodeAmount(discount);
                })   
        }

        return newOrder;
    }

    /*
        1> Query Orders[User]
     */
    static async getOrderByUser({ userId }){
        const foundUser = await findUserById({userId});
        if(!foundUser) throw new NotFoundError('user not found');

        const listOder = await order.find({order_userId: userId}).lean();

        return listOder
    }
    /*
        2> Query Orders Using Id[User]
     */
    static async getOneOrderByUser({ orderId }){
        return await order.findById(orderId).lean();
    }

    /*
        2> Query Orders Shop Id[User]
     */
    static async getOrderByShop({ shopId }){
        try {
            const orders =  await order.aggregate([
                {
                    $unwind: '$order_products'
                },
                {
                    // Convert `order_products.shopId` to ObjectId
                    $addFields: {
                        'order_products.shopId': {
                            $convert: {
                                input: '$order_products.shopId',
                                to: 'objectId',
                                onError: null, // handle conversion error by setting to null
                                onNull: null  // handle null input by setting to null
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'order_products.shopId',
                        foreignField: '_id',
                        as: 'Users'
                    }
                }
            ]);
            return orders;
        } catch (error) {
            
        }   
    }


    /*
        3> Cancel Orders[User]
     */
    static async cancelOrderByUser({
        orderId,
        refreshToken,
        user,
        keyStore, 
    }){
        const orderDetail = await this.getOneOrderByUser({orderId});

        if(orderDetail.order_status === 'canceled'){
            throw new BadRequestError('Order cancelled')
        }

        const userDetail = await getUserDetailByRefreshToken({
                refreshToken,
                user,
                keyStore,
        })

        // console.log(orderDetail.order_userId, userDetail);

        if(userDetail.user.usr_id === orderDetail.order_userId) {
            const updateOrInsert = {
                order_status: 'canceled'
            }, options = { upsert: true, new: true};
            const orderNew = await order.findByIdAndUpdate( orderId, updateOrInsert, options ); 
            orderNew.order_products.forEach( order => {
                rollbackInventory({ productId: order.item_products[0].productId, quantity: order.item_products[0].quantity, shopId: order.shopId })
            });
            return 1;
        }
        return 0;
    }
    /*
        4> Update Orders Status [Shop| Admin]
     */
    static async updateOrderStatusByShop({ orderId, order_status }){
        const updateSet = {
            $set: {
                order_status: order_status
            }
        }, options = { upsert: true, new: true};

        return await order.findByIdAndUpdate( orderId, updateSet, options );
    }
}

module.exports = CheckoutService;