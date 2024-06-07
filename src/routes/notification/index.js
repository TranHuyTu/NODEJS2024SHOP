'use strict';

const express = require('express');
const notificationController = require('../../controllers/notification.controller');
const { asyncHandler } = require('../../auth/checkAuth');
const { authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

// authentication //
router.use(authenticationV2);

router.get('', asyncHandler(notificationController.listNotiByUser));


module.exports = router