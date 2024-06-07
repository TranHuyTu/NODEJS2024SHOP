'use strict';

const { SuccessResponse } = require("../core/success.response");
const { newUserService, checkLoginEmailTokenService, loginUserService, 
    updateUserService, deleteUserService, getUserDetailByRefreshToken, 
    findByUserShopAll, findByUserAll, findByUserId, updatePasswordNewByUserId, 
    updateRoleByUserId, getRoleByUser, queryUser, 
    findUserByShop,
    findUserByUser,
    queryUserById} = require("../services/user.service");

class UserController{
    //new user
    newUser = async(req, res, next) => {
        const respond = await newUserService({
            email: req.body.email
        })
        new SuccessResponse(respond).send(res);
    }

    //check user token via email
    checkLoginEmailToken = async(req, res, next) => {
        const { token = null } = req.query;
        new SuccessResponse({
            message: 'check Login Email Token Service',
            metadata: await checkLoginEmailTokenService({
                token
            })
        }).send(res);
    }

    loginUser = async(req, res, next) => {
        new SuccessResponse({
            message: 'Login User Successfully',
            metadata: await loginUserService({
                email: req.body.email,
                password: req.body.password,
            })
        }).send(res);
    }

    updateUser = async(req, res, next) => {
        new SuccessResponse({
            message: 'Update User Successfully',
            metadata: await updateUserService({userId: req.params.id, bodyUpdate: {...req.body}})
        }).send(res);
    }

    deleteUser = async(req, res, next) => {
        const {userId} = req.params.id;
        new SuccessResponse({
            message: 'Delete User Successfully',
            metadata: await deleteUserService({ userId })
        }).send(res);
    }

    getUserDetailByRefreshToken = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get token success !',
            metadata: await getUserDetailByRefreshToken({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore,
            })
        }).send( res );
    }

    findByUserShopAll = async(req, res, next) => {
        new SuccessResponse({
            message: 'get user role shop Successfully',
            metadata: await findByUserShopAll()
        }).send(res);
    }

    findByUserAll = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get all User Successfully',
            metadata: await findByUserAll()
        }).send(res);
    }

    findByUserId = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get all User Successfully',
            metadata: await findByUserId({userId: req.params.id})
        }).send(res);
    }

    updateStatusByUserId = async(req, res, next) => {
        new SuccessResponse({
            message: 'update status by user Service',
            metadata: await updateStatusByUserId(req.body)
        }).send(res);
    }

    updatePasswordNewByUserId = async(req, res, next) => {
        new SuccessResponse({
            message: 'Update password new by user Service',
            metadata: await updatePasswordNewByUserId({email: req.body.email})
        }).send(res);
    }

    updateRoleByUserId = async(req, res, next) => {
        new SuccessResponse({
            message: 'update role by user by user Service',
            metadata: await updateRoleByUserId(req.body)
        }).send(res);
    }

    getRoleByUser = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get token success !',
            metadata: await getRoleByUser({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore,
            })
        }).send( res );
    }

    queryUser = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get token success !',
            metadata: await queryUser(req.query)
        }).send( res );
    }

    queryUserById = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get token success !',
            metadata: await queryUserById(req.query)
        }).send( res );
    }

    findUserByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get token success !',
            metadata: await findUserByShop(req.query)
        }).send( res );
    }
    
    findUserByUser = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get token success !',
            metadata: await findUserByUser(req.query)
        }).send( res );
    }
}

module.exports = new UserController();