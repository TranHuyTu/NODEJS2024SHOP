'use strict';

const { 
    BadRequestError,
    NotFoundError
} = require('../core/error.response')
const {convertToObjectIdMongodb} = require('../utils')

const {findAllProducts} = require('../models/repositories/product.repo')
const {
    findAllDiscountCodeSelect, findAllDiscountCodeUnSelect, checkDiscountExists
} = require('../models/repositories/discount.repo')

const discount = require('../models/discount.model')

/**
 * Discount Service
 * Generator Discount Code [Shop | Admin]
 * Get discount amount [ User ]
 * Get all discount codes [User | Admin]
 * Verify discount code [User]
 * Delete discount code [Shop | Admin]
 * Cancel discount code [User]  
 */

class DiscountService {

    static async createDiscountCode(payload) {
        const {
            discount_image, code, start_date, end_date, is_active,users_used,
            shopId, min_order_value, product_ids, applies_to, name, description,
            type, value, max_value, max_uses, uses_count, max_uses_per_user, discount_users_apply
        }=payload;

        //kiem tra

        if(new Date() > new Date(start_date) || new Date(end_date) < new Date()){
            throw new BadRequestError('Discount code has expired!');
        }

        if(new Date(start_date)>=new Date(end_date)){
            throw new BadRequestError('Start_date must be before end_date');
        }

        //create index for discount code
        const foundDiscount = discount.findOne({
            discount_code: code,
            discount_code: convertToObjectIdMongodb(shopId),
        }).lean();

        if(foundDiscount && foundDiscount.discount_is_active){
            throw new BadRequestError('Discount exists!');
        }

        const newDiscount = await discount.create({
            discount_name: name,
            discount_image: discount_image,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_code: code,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_max_uses_per_user: max_uses_per_user,
            discount_users_apply: discount_users_apply || [],
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_shopId: shopId,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to == 'all' ? [] : product_ids,
        })

        return newDiscount;
    }

    static async updateDiscountCode(payload){
        const {
            discount_image, code, start_date, end_date, is_active,users_used,
            shopId, min_order_value, product_ids, applies_to, name, description,
            type, value, max_value, max_uses, uses_count, max_uses_per_user, discount_users_apply
        }=payload;

        //kiem tra

        if(new Date() > new Date(start_date) || new Date(end_date) < new Date()){
            throw new BadRequestError('Discount code has expired!');
        }

        if(new Date(start_date)>=new Date(end_date)){
            throw new BadRequestError('Start_date must be before end_date');
        }

        //create index for discount code
        const foundDiscount = discount.findOne({
            discount_code: code,
            discount_code: convertToObjectIdMongodb(shopId),
        }).lean();

        if(!foundDiscount ){
            throw new BadRequestError('Discount not exists!');
        }

        const newDiscount = await discount.findOneAndUpdate({
            discount_code: code,
            discount_code: convertToObjectIdMongodb(shopId),
        },{
            discount_name: name,
            discount_image: discount_image,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_code: code,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_users_apply: discount_users_apply || [],
            discount_max_uses_per_user: max_uses_per_user,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_shopId: shopId,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to == 'all' ? [] : product_ids,
        })

        return newDiscount;
    }

    /**
     * Get all discount codes available with products
     */
    static async getAllDiscountCodeWithProduct({
        code, shopId, limit, page
    }){
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId),
        }).lean();

        if(!foundDiscount || !foundDiscount.discount_is_active){
            throw new NotFoundError('discount not exists');
        }
        const {discount_applies_to, discount_product_ids} = foundDiscount;
        let products;
        if(discount_applies_to === 'all'){
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            });
        }
        if(discount_applies_to === 'specific'){
            products = await findAllProducts({
                filter: {
                    _id: {$in: discount_product_ids},
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            });
        }

        return products;
    }

    static async getAllDiscountCodeByProductId({shopId, productId, userId}){
        if(userId){
            const foundDiscount = await discount.find({
                discount_shopId: convertToObjectIdMongodb(shopId),
                    discount_product_ids: { $in:  [productId]} ,
                    discount_users_apply:  { $in:  [userId]}, 
                    discount_is_active: true
                });
            const discounts = await foundDiscount.filter(discount => new Date() > new Date(discount.discount_start_date) && new Date(discount.discount_end_date) > new Date())
                
            return discounts
        }else{
            const foundDiscount = await discount.find({
                discount_shopId: convertToObjectIdMongodb(shopId),
                    discount_product_ids: { $in:  [productId]} , 
                    discount_is_active: true
                });
            const discounts = await foundDiscount.filter(discount => new Date() > new Date(discount.discount_start_date) && new Date(discount.discount_end_date) > new Date())
                
            return discounts
            // return await discount.find({
            //     discount_shopId: convertToObjectIdMongodb(shopId),
            //         discount_product_ids: { $in:  [productId]} ,
            //         discount_is_active: true
            //     });
        }
    }

    static async getDiscountCodeByCode({shopId, codeId}){
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true
            }
        })

        if(!foundDiscount) throw new NotFoundError(`discount doesn't exits`);

        return foundDiscount;
    }

    static async getAllDiscountCodeUserByShop({
        shopId
    }){
        const foundDiscount = await discount.find({
            discount_shopId: shopId,
            discount_is_active: true
        });

        const discounts = await foundDiscount.filter(discount => new Date() > new Date(discount.discount_start_date) && new Date(discount.discount_end_date) > new Date())

        return discounts
    }

    static async getAllDiscountCodeByUserId({userId}){
        return await discount.find({
            discount_users_apply:  { $in:  [userId]}, 
            discount_is_active: true
        });
    }



    /**
     * Get all discount code if shop
     */

    static async getAllDiscountCodeByShop({
        limit, page, shopId
    }){
        const discounts = await findAllDiscountCodeUnSelect({
            limit: +limit,
            page: +page,
            filter:{
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discount
        })
        return discounts
    }
    //Apply Discount Code
    static async getDiscountAmount({ codeId, userId, shopId, products }){
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId),
            }
        })

        if(!foundDiscount) throw new NotFoundError(`discount doesn't exits`);
        
        const {
            discount_start_date,
            discount_end_date,
            discount_is_active,
            discount_max_uses,
            discount_min_order_value,
            discount_users_used,
            discount_max_uses_per_user,
            discount_type,
            discount_value
        } = foundDiscount;

        if(!discount_is_active) throw new NotFoundError(`discount expired !`);
        if(!discount_max_uses) throw new NotFoundError(`discount are out`);

        if(new Date() < new Date(discount_start_date) || new Date(discount_end_date) < new Date()){
            throw new NotFoundError(`discount ecode has expired!`);
        }

        let totalOrder = 0;
        if(discount_min_order_value > 0){
            totalOrder = products.reduce((acc, product) =>{
                return acc + (product.quantity*product.price);
            },0);
            
            if(totalOrder < discount_min_order_value){
                throw new NotFoundError(`discount required a minimum order value of ${discount_min_order_value}!`);
            }
        }

        if(discount_max_uses_per_user > 0){
            const userUserDiscount = discount_users_used.find(user => user === userId);
            if(userUserDiscount){
                throw new NotFoundError(`This discount is no longer available to you.`)
            }
        }

        const amount = discount_type === 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100);

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }
    }

    static async deleteDiscountCode({ shopId, codeId }){
        const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongodb(shopId)
        })

        return deleted;
    }

    static async cancelDiscountCode({ shopId, codeId, userId }){
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter:{
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        });

        if(!foundDiscount) throw new NotFoundError(`discount doesn't exist!`);

        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId
            },
            $inc: {
                discount_max_uses_per_user: 1,
                discount_uses_count: -1
            }
        })

        return result;
    }

    static async updateDiscountCodeAmount({ shopId, codeId, userId }){
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter:{
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        });

        if(!foundDiscount) throw new NotFoundError(`discount doesn't exist!`);

        if(foundDiscount.discount_max_uses_per_user > 0){
            const userUserDiscount = foundDiscount.discount_users_used.find(user => user === userId);

            if(userUserDiscount){
                throw new NotFoundError(`This discount is no longer available to you.`)
            }else{
                const result = await discount.findByIdAndUpdate(foundDiscount._id, {
                    $addToSet: {
                        discount_users_used: userId
                    },
                    $pull: {
                        discount_users_apply: userId
                    },
                    $inc: {
                        discount_max_uses_per_user: -1,
                        discount_uses_count: 1
                    }
                })
                return result;
            }     
        }
    }

    static async addDiscount({ shopId, codeId , userId}){
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter:{
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        });

        if(!foundDiscount) throw new NotFoundError(`discount doesn't exist!`);

        if(foundDiscount.discount_max_uses_per_user > foundDiscount.discount_users_apply.length){
            const check = foundDiscount.discount_users_apply.filter(discount => discount===userId);
            const checkUsed = foundDiscount.discount_users_used.filter(discount => discount===userId);
            if(check.length !== 0 || checkUsed.length !== 0){
                return null;
            }else{
                const result = await discount.findByIdAndUpdate(foundDiscount._id, {
                    $addToSet: {
                        discount_users_apply: userId
                    }
                })
                return result;
            }
        }     
    }
}

module.exports = DiscountService;