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
            code, start_date, end_date, is_active,users_used,
            shopId, min_order_value, product_ids, applies_to, name, description,
            type, value, max_value, max_uses, uses_count, max_uses_per_user,
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
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_shopId: shopId,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to == 'all' ? [] : product_ids,
        })

        return newDiscount;
    }

    static async updateDiscountCode(){

    }

    /**
     * Get all discount codes available with products
     */
    static async getAllDiscountCodeWithProduct({
        code, shopId, userId, limit, page
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

    /**
     * Get all discount code if shop
     */

    static async getAllDiscountCodeByShop({
        limit, page,shopId
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
            const userUserDiscount = discount_users_used.find(user => user.userId === userId);
            if(userUserDiscount){
                //... and
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
            discount_shopId: shopId
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
                discount_max_uses: 1,
                discount_users_used: -1
            }
        })

        return result;
    }
}

module.exports = DiscountService;