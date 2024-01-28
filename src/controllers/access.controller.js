'use strict';

const AccessService = require('../services/access.service');

const { CREATE, OK } = require('../core/success.response');

class AccessController{

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