'use strict';

const {
    SuccessResponse
} = require('../core/success.response');
const {
    createComment,
    deleteComments,
    getCommentsByParentId
} = require('../services/comment.service');

class CommentController{

    createComment = async(req, res, next)=>{
        new SuccessResponse({
            message: 'create new comment',
            metadata: await createComment(req.body)
        }).send(res);
    }

    deleteComments = async(req, res, next)=>{
        new SuccessResponse({
            message: 'deleteComment',
            metadata: await deleteComments(req.body)
        }).send(res);
    }

    getCommentsByParentId = async(req, res, next)=>{
        new SuccessResponse({
            message: 'getCommentsByParentId',
            metadata: await getCommentsByParentId(req.query)
        }).send(res);
    }
}

module.exports = new CommentController();