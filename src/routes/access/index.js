'use strict';

const express = require('express');
const accessController = require('../../controllers/access.controller')
const { asyncHandler } = require('../../auth/checkAuth');
const { authentication , authenticationV2} = require('../../auth/authUtils');
const router = express.Router();

//SignUp routes
router.post('/shop/signup', asyncHandler(accessController.signUP))
//Login routes
router.post('/shop/login', asyncHandler(accessController.login))

// authentication //
router.use(authenticationV2);
/////////////////
router.post('/shop/logout', asyncHandler(accessController.logout))
router.post('/shop/handlerRefreshToken', asyncHandler(accessController.handlerRefreshToken))

module.exports = router