'use strict';

const { model, Schema } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Discount';
const COLLECTION_NAME = 'discounts'

// Declare the Schema of the Mongo model
var discountSchema = new Schema({
    discount_name: { type: String, required: true },
    discount_description: { type: String, required: true },
    discount_type: { type: String, default: 'fixed_amount'},
    discount_value: { type: Number, required: true },
    discount_max_value: { type: Number, required: true },
    discount_code: { type: String, required: true },
    discount_start_date: { type: Date, required: true },
    discount_end_date: { type: Date, required: true },
    discount_max_uses: { type: Number, required: true },
    discount_uses_count: { type: Number, required: true},
    discount_users_used: { type: Array, default: []},
    discount_max_uses_per_user: { type: Number, required: true},
    discount_min_order_value: { type: Number, required: true },
    // discount_max_value: { type: Number, required: true },
    discount_shopId: { type: Schema.Types.ObjectId, ref: 'Shop'},

    discount_is_active: { type: Boolean, required: true },
    discount_applies_to: { type: String, required: true , enum: ['all','specific']},
    discount_product_ids: { type: Array, default: [] },
    /**
     * Thiếu giá tối thiểu để nhận discount
     * Danh mục sản phẩm cụ thể được nhận discount đối với sản phẩm lón
     * Thiếu các khu vực áp dụng
     * Thiếu giảm giá có thể xếp chồng lên nhau hoặc các mã có thể triệt tiêu nhau
     * Hệ thống nhắc nhở người dùng khi mã sắp hết hạn
     * Lịch sử sử dụng sau mỗi lần giảm giá
     */
},{
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema);