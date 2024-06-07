'use strict';

const express = require('express');
const { profiles, profile } = require('../../controllers/profile.controller');
const { grantAccess } = require('../../middlewares/rbac');
const { findByUserShopAll, findByUserAll, findByUserId } = require('../../controllers/user.controller');
const { authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();


router.use(authenticationV2);
//admin
router.post('/viewAny', grantAccess('readAny', 'profile'), findByUserAll);
router.post('/viewOwn', grantAccess('readAny', 'profile'), findByUserShopAll);

//shop
router.post('/:id', grantAccess('readOwn', 'profile'), findByUserId);

module.exports = router