'use strict';

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError, AuthFailureError, ForbiddenError} = require('../core/error.response');
const { findByEmail } = require("./shop.service");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: '001',
    EDITOR: '002',
    ADMIN: 'ADMIN'
}

class AccessService {
    /**
     * check token used?
     */
    static handlerRefreshToken = async ( refreshToken ) => {
        const foundToken = await KeyTokenService.findByRefreshTokenUsed( refreshToken );
        if(foundToken) {
            const { userId, email } = await verifyJWT( refreshToken, foundToken.privateKey );
            console.log( userId, email );
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError('Something wrong happened !! Pls relogin!!');
        }

        const holderToken = await KeyTokenService.findByRefreshToken( refreshToken );
        if(!holderToken) throw new AuthFailureError(' Shop not registered');

        const { userId, email } = await verifyJWT( refreshToken, holderToken.privateKey );
        console.log('[2]--', userId, email );

        const foundShop = await findByEmail({ email });
        if(!foundShop) throw new AuthFailureError(' Shop not registered 2');

        const tokens = await createTokenPair({userId, email}, holderToken.publicKey, holderToken.privateKey);
        console.log('[3]--', tokens)
        
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokenUsed: refreshToken
            }
        })

        return {
            user: {userId, email},
            tokens
        }
    }

    static handlerRefreshTokenV2 = async ({ keyStore, user, refreshToken }) => {
        const { userId, email } = user;

        console.log(userId, email);
        if(keyStore.refreshTokenUsed.includes(refreshToken)){
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError('Something wrong happened !! Pls relogin!!');
        }

        if(keyStore.refreshToken !== refreshToken) throw new AuthFailureError('Shop not refreshed');

        const foundShop = await findByEmail({ email });
        if(!foundShop) throw new AuthFailureError(' Shop not registered 2');

        const tokens = await createTokenPair({userId, email}, keyStore.publicKey, keyStore.privateKey);
        
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokenUsed: refreshToken
            }
        })

        return {
            user,
            tokens
        }
    }

    static logout = async ( keyStore ) => {
        const delKey = await KeyTokenService.removeKeyById( keyStore._id );
        console.log( delKey );
        return delKey;
    }

    /*
     1 - check email in dbs
     2 - match password
     3 - create AT vs RT and save
     4 - generate tokens
     5 - get data return login
     */

     static login = async ({ email, password, refreshToken = null }) => {
        //1.
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new BadRequestError('Shop not registered');

        //2
        const match = await bcrypt.compare(password, foundShop.password);
        if(!match) throw new AuthFailureError('Authentication error');

        //3 
        // create PublicKey, PrivateKey
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
        //4 = generate tokens
        const {_id: userId} = foundShop;
        const publicKeyString = await KeyTokenService.createKeyToken({
                userId,
                publicKey,
                privateKey
            })
        const publicKeyObject = crypto.createPublicKey(publicKeyString);
        
        const tokens = await createTokenPair({ userId, email}, publicKeyObject, privateKey);

        await KeyTokenService.createKeyToken({
            userId,
            refreshToken: tokens.refreshToken,
            privateKey, publicKey: publicKeyString
        })
        
        return {
            shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: foundShop}),
            tokens
        }
     };

    static signUp = async ({ name, email, password })=>{

        const holderShop = await shopModel.findOne({ email }).lean();
        if (holderShop){
            throw new BadRequestError('Error: Shop already registered!');
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
                publicKey,
                privateKey
            })

            console.log(publicKeyString);

             if(!publicKeyString){

                 throw new BadRequestError('Error: publicKeyString error!')
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