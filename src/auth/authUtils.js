'use strict';

const JWS = require('jsonwebtoken');
const asyncHandler = require('../helpers/asyncHandler');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/keyToken.service')

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id',
}

const createTokenPair = async ( payload, publicKey, privateKey ) =>{
    try {
        const accessToken = await JWS.sign( payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '2 days',
        })

        const refreshToken = await JWS.sign( payload, privateKey,{
            algorithm: 'RS256',
            expiresIn: '7 days',
        })

        JWS.verify( accessToken, publicKey, (err, decode) => {
            if(err){
                console.error('error verifying', err);
            }else{
                console.log('decode verified', decode);
            }
        })

        return { accessToken, refreshToken }
    } catch (error) {
        console.log(error);
    }
}

const authentication = asyncHandler( async ( req, res, next) => {
    /**
     * 1 - Check userID missing
     * 2 - get accessToken
     * 3 - verifyToken
     * 4 - check user in dbs
     * 5 - check keyStore with this userID
     * 6 - OK all -> return next
     */
    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new AuthFailureError('Invalid Request');

    //2
    const keyStore = await findByUserId( userId );
    console.log(keyStore);
    if (!keyStore) throw new NotFoundError('Not Found keyStore');

    //3
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if(!accessToken) throw new AuthFailureError('Invalid Request');

    try {
        const decodeUser = JWS.verify( accessToken, keyStore.publicKey)
        if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid User');
        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw error;
    }
})

const authenticationV2 = asyncHandler( async ( req, res, next) => {
    /**
     * 1 - Check userID missing
     * 2 - get accessToken
     * 3 - verifyToken
     * 4 - check user in dbs
     * 5 - check keyStore with this userID
     * 6 - OK all -> return next
     */
    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new AuthFailureError('Invalid Request');

    //2
    const keyStore = await findByUserId( userId );
    if (!keyStore) throw new NotFoundError('Not Found keyStore');

    if(req.headers[HEADER.REFRESHTOKEN]){
        try {
            const refreshToken = req.headers[HEADER.REFRESHTOKEN];
            const decodeUser = JWS.verify( refreshToken, keyStore.privateKey);
            if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserId');
            req.keyStore = keyStore;
            req.user = decodeUser;
            req.refreshToken = refreshToken;
            console.log('Successfully authenticated');
            return next();
        } catch (error) {
            throw error;
        }
    }
    //3
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if(!accessToken) throw new AuthFailureError('Invalid Request');

    try {
        const decodeUser = JWS.verify( accessToken, keyStore.publicKey)
        if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid User');
        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw error;
    }
})

const verifyJWT = async (token, keySecret) => {
    return await JWS.verify(token, keySecret);
}

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT,
    authenticationV2,
}