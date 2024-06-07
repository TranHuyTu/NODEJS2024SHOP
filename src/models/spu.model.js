'use strict';

const { Schema, model } = require('mongoose');
const slugify = require('slugify');

const DOCUMENT_NAME = 'Spu';
const COLLECTION_NAME = 'Spus';

const spuSchema = new Schema({
    product_id: { type: Number, required: true, unique: true},
    product_name: {type: String, required: true},
    product_thumb: {type: String, required: true},
    product_description: String,
    product_slug: String,
    product_price: {type: Number, required: true},
    product_category: {type: Array, default: []},
    product_quantity: {type: Number, required: true},
    //product_type: {type: String, required: true, enum: ['Electronics', 'Clothing', 'Furniture']},
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop'},
    product_attributes: {type: Schema.Types.Mixed, require: true},
    /**
     * 
     */
    product_ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be above 5.0'],

        set: (val) => Math.round(val * 10) / 10,
    },
    product_no_of_ratings: { type: Array, default: [] },
    product_variations: { type: Array, default: []},
    /**
     * tier_variation: [
     * {
     * image: [],
     * name: 'color',
     * options: ['red', 'green', 'blue]
     * },
     * {
     * name: 'size',
     * options: ['S', 'M', 'XL']
     * }
     * ]
     */
    isDraft: { type: Boolean, default: true, index: true , select: false},
    isPublished: { type: Boolean, default: false, index: true , select: false},
    isDelete: { type: Boolean, default: false }
}, {
    collection: COLLECTION_NAME,
    timestamps: true,
});

//create index for search
spuSchema.index({ product_name: 'text', product_description: 'text'})

//Document middleware: runs before .save and .create ...
spuSchema.pre('save', function( next ){
    this.product_slug = slugify(this.product_name, {lower: true});
    next();
}) 

module.exports = model(DOCUMENT_NAME, spuSchema)