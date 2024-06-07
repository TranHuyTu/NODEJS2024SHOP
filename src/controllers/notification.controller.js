'use strict';

const {
    SuccessResponse
} = require('../core/success.response');
const {
    listNotiByUser
} = require('../services/notification.service');

class CommentController{

    listNotiByUser = async(req, res, next)=>{
        new SuccessResponse({
            message: 'listNotiByUser',
            metadata: await listNotiByUser(req.query)
        }).send(res);
    }
}

module.exports = new CommentController();