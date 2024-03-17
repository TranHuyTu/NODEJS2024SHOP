'use strict';

const AccessService = require('../services/access.service');

const { CREATE, OK, SuccessResponse } = require('../core/success.response');

class AccessController{
    handlerRefreshToken = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get token success !',
            metadata: await AccessService.handlerRefreshTokenV2({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore,
            })
        }).send( res );
    }

    login = async (req, res, next) => {
        new SuccessResponse({
            metadata: await AccessService.login( req.body )
        }).send( res );
    }

    logout = async (req, res, next) => {
        new SuccessResponse({
            message: 'Logout successfully',
            metadata: await AccessService.logout( req.keyStore )
        }).send( res );
    }

    signUP = async (req, res, next) => {
            
        //return res.status(201).json(await AccessService.signUp(req.body));

        new CREATE({
            message: 'Registered OK',
            metadata: await AccessService.signUp(req.body),
            options:{
                limit: 10
            }
        }).send(res);
    }
}

module.exports = new AccessController();