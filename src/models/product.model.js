'use strict';

const { Schema, model } = require('mongoose');
const slugify = require('slugify');

const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products';

const productSchema = new Schema({
    product_id: { type: Number, required: true, unique: true},
    product_name: {type: String, required: true},
    product_thumb: {type: Array, default: []},
    product_description: String,
    product_slug: String,
    product_price: {type: Number, required: true},
    product_discounted_price: {type: Number, default: 0},
    product_category: {type: String, default: ''},
    product_quantity: {type: Array, required: true, default: []},
    //[{'type':'red', quantity: 100}, {'type':'green', quantity: 100}]
    product_type: {type: String, required: true, enum: ['Electronics', 'Clothing', 'Furniture']},
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop'},
    product_attributes: {type: Schema.Types.Mixed, default: {}, require: true},
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
    img_link: { type: Array, default: []},
    product_variation: { type: Array, default: []},
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
productSchema.index({ product_name: 'text', product_description: 'text', product_category: 'text'})

//Document middleware: runs before .save and .create ...
productSchema.pre('save', function( next ){
    this.product_slug = slugify(this.product_name, {lower: true});
    next();
}) 

const clothingSchema = new Schema({
    brand: {type: String, require: true},
    size: String,
    material: String,
    product_attributes: {type: Schema.Types.Mixed, default: {}, require: true},
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop'},
},{
    collection: 'clothes',
    timestamps: true,
});

const furnitureSchema = new Schema({
    brand: {type: String, require: true},
    size: String,
    material: String,
    product_attributes: {type: Schema.Types.Mixed, default: {}, require: true},
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop'},
},{
    collection: 'furnitures',
    timestamps: true,
});

const electronicSchema = new Schema({
    manufacturer: {type: String, require: true},
    model: String,
    color: String,
    product_attributes: {type: Schema.Types.Mixed, default: {}, require: true},
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop'},
},{
    collection: 'electronics',
    timestamps: true,
});

module.exports = {
    product: model( DOCUMENT_NAME, productSchema),
    electronic: model( 'Electronics', electronicSchema),
    clothing: model( 'Clothing', clothingSchema),
    furniture: model( 'Furniture', furnitureSchema),
}