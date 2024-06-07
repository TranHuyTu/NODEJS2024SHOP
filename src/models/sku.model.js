'use strict';

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Sku';
const COLLECTION_NAME = 'Skus';

const skuSchema = new Schema({
    sku_id: { type: String, required: true, unique: true},
    sku_tier_idx: { type: Array, default: [0] },
    /*
    color = [red, green, blue] = [0,1,2]
    size = [S,M] = [0,1]

    => red + S = [0, 0]
    red + M = [0, 1]
    */
    sku_default: { type: Boolean, default: false },
    sku_slug: { type: String, default: ''},
    sku_sort: { type: Number, default: 0 },
    product_id: { type: Number, required: true},

    isDraft: { type: Boolean, default: true, index: true , select: false },
    isPublished: { type: Boolean, default: false, index: true , select: false },
    isDelete: { type: Boolean, default: false }
}, {
    collection: COLLECTION_NAME,
    timestamps: true,
});

module.exports = model(DOCUMENT_NAME, skuSchema)