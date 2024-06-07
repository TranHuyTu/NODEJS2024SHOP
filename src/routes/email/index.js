'use strict';

const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { authenticationV2 } = require('../../auth/authUtils');
const { newTemplate } = require('../../controllers/email.controller');
const router = express.Router();


router.post('/new_template', asyncHandler(newTemplate));

module.exports = router