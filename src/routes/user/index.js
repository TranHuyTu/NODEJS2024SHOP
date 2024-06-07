'use strict';

const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { authenticationV2 } = require('../../auth/authUtils');
const { newUser, checkLoginEmailToken, loginUser, updateUser, deleteUser, getUserDetailByRefreshToken, updateStatusByUserId, updatePasswordNewByUserId, updateRoleByUserId, getRoleByUser, queryUser, findUserByShop, findUserByUser, queryUserById } = require('../../controllers/user.controller');
const router = express.Router();


router.post('/query', asyncHandler(queryUser));
router.post('/new_user', asyncHandler(newUser));
router.post('/login', asyncHandler(loginUser));
router.post('/welcome_back', asyncHandler( checkLoginEmailToken ));
router.patch('/:id', asyncHandler(updateUser));
router.post('/forgot_password', asyncHandler(updatePasswordNewByUserId));

router.use(authenticationV2);

router.post('/role', asyncHandler(getRoleByUser));
router.post('/shop', asyncHandler(queryUserById));
router.post('/all/shop', asyncHandler(findUserByShop));
router.post('/all/user', asyncHandler(findUserByUser));
router.post('/profile', asyncHandler(getUserDetailByRefreshToken));
router.post('/status', asyncHandler(updateStatusByUserId));
router.post('/role_update', asyncHandler(updateRoleByUserId));
router.delete('/:id', asyncHandler(deleteUser));



module.exports = router