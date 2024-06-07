'use strict';

const express = require('express');
const commentController = require('../../controllers/comment.controller')
const { asyncHandler } = require('../../auth/checkAuth');
const { authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

// authentication //
router.use(authenticationV2);

router.post('', asyncHandler(commentController.createComment));
router.delete('', asyncHandler(commentController.deleteComments));
router.get('', asyncHandler(commentController.getCommentsByParentId));


module.exports = router