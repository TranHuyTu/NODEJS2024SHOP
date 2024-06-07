'use strict';

const crypto = require('crypto');
const OTP = require('../models/otp.model');
const { NotFoundError } = require('../core/error.response');

const generatorTokenRandom = () => {
    const token = crypto.randomInt(0, Math.pow(2,32));
    return token;
}

const newOTP = async({
    email
}) => {
    const token = generatorTokenRandom();
    const newToken = await OTP.create({
        otp_token: token,
        otp_email: email
    })

    return newToken
}

const checkEmailToken = async ({
    token
}) => {
    //check token in model otp
    const hasToken = await OTP.findOne({
        otp_token: token
    })
    if(!hasToken) throw new NotFoundError('token not found');

    //delete token from model
    OTP.deleteOne({ otp_token: token }).then();

    return hasToken;
}

module.exports = {
    newOTP,
    checkEmailToken
}