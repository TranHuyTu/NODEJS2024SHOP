'use strict';

const JWS = require('jsonwebtoken');

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

module.exports = {
    createTokenPair
}