'use strict';

const keyTokenModel = require('../models/keytoken.model');
const { Types } = require('mongoose');

class KeyTokenService{

    static createKeyToken = async ({userId, publicKey, privateKey, refreshToken}) => {
        try {
            //lv0
            //     const publicKeyString = publicKey.toString();
            //     const tokens = await keyTokenModel.create({
            //     user: userId,
            //     publicKey: publicKeyString
            // })

            // return tokens ? tokens.publicKey : null;
            const filter = {user: new Types.ObjectId(userId)}, update = {
                publicKey, privateKey, refreshTokenUsed: [], refreshToken
            }, options = { upsert: true, new: true };
            
            const tokens = await keyTokenModel.findOneAndUpdate( filter, update, options );

            return tokens ? tokens.publicKey : null;
        } catch (error) {
            return error;
        }
    }

    static findByUserId = async ( userId ) => {
        return await keyTokenModel.findOne({ user: userId});
    }

    static removeKeyById = async ( id ) => {
        return await keyTokenModel.deleteOne( id );
    }
    static findByRefreshToken = async ( refreshToken ) => {
        return await keyTokenModel.findOne({ refreshToken });
    }
     static findByRefreshTokenUsed = async ( refreshToken ) => {
        return await keyTokenModel.findOne({ refreshTokenUsed: refreshToken}).lean();
    }
    static deleteKeyById = async ( userId ) => {
        return await keyTokenModel.findOneAndDelete({ user: userId});
    }
}

module.exports = KeyTokenService;