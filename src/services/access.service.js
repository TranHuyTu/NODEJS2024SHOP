'use strict';

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { ConflictResponseError, BadResponseError} = require('../core/error.response');

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: '001',
    EDITOR: '002',
    ADMIN: 'ADMIN'
}

class AccessService {
    static signUp = async ({ name, email, password })=>{

        const holderShop = await shopModel.findOne({ email }).lean();
        if (holderShop){
            throw new BadResponseError('Error: Shop already registered!');
        }

        const passwordHash = await bcrypt.hash(password,10);
        const newShop = await shopModel.create({
            name, email, password: passwordHash, roles: [RoleShop.SHOP]
        })

        if(newShop){
            //create privaterKey, publicKey
            const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa',{
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: 'pkcs1',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs1',
                    format: 'pem'
                }
            })
            //Public Key CryptoGrapy Standard 

             console.log({privateKey, publicKey})

             const publicKeyString = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey
            })

             console.log(publicKeyString);

             if(!publicKeyString){

                 throw new BadResponseError('Error: publicKeyString error!')
                // return {
                //     code: 'xxxx',
                //     message: 'publicKeyString error',
                // }
            }

             console.log('PublicKeyToString:: ',publicKeyString);
            const publicKeyObject = crypto.createPublicKey(publicKeyString);

             //create token pair
            const tokens = await createTokenPair({userId: newShop._id, email}, publicKeyObject, privateKey);
            console.log('Created Token Success', tokens);

             return {
                code: '201',
                metadata: {
                    shop: getInfoData({fileds: ['_id', 'name', 'email'], object: newShop}),
                    tokens
                }
            }
        }
        return {
            code: '200',
            metadata: null
        }
    }
}

module.exports = AccessService;