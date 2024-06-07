"use strict";

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'User';
const COLLECTION_NAME = 'Users';

const userSchema = new Schema({
    usr_id: { type: Number, required: true, unique: true},
    usr_slug: { type: String, required: true}, 
    usr_first_name: { type: String, default: ''},
    usr_last_name: { type: String, default: ''},
    usr_password: { type: String, default: ''},
    usr_salf: { type: String, default: ''},
    usr_email: { type: String, required: true, unique: true},
    usr_phone: { type: String, default: ''},
    usr_sex: { type: String, default: ''},
    usr_avatar: { type: String, default: ''},
    usr_date_of_birth: { type: Date, default: null },
    usr_address: { type: String, default: '' },
    usr_state: { type: String, default: '' },
    usr_city: { type: String, default: '' },
    usr_country: { type: String, default: '' },
    usr_postal_code: { type: String, default: '' },
    usr_role: { type: Schema.Types.ObjectId, ref: 'Role' },
    usr_status: { type: String, default: 'pending', enum: ['pending', 'active', 'block'] },
},{
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, userSchema);