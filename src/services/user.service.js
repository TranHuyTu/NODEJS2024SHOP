'use strict';

const USER = require('../models/user.model');
const { ErrorResponse, NotFoundError, AuthFailureError } = require('../core/error.response');
const { sendEmailToken, sendEmailNewPassword } = require('./email.service');
const { checkEmailToken } = require('./otp.service');

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { createUser, findUserByEmail, findAllUsers, updateStatusByUser, updatePasswordNewByUser, updateRoleByUser, findUserById } = require('../models/repositories/user.repo');
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData, convertToObjectIdMongodb } = require('../utils');
const { BadRequestError} = require('../core/error.response');
const {findRoleIdByName, findRoleByID } = require('./rbac.service');

const newUserService = async ({
    email = null,
    captcha = null,
}) => {
    //1. check email exists in dbs
    const user = await USER.findOne({ usr_email: email }).lean();
    //2. if existing
    if( user ) throw new ErrorResponse('Email already exists');

    //3. send tokens via email user
    const result = await sendEmailToken({
        email
    })

    return {
        message: 'verify email user',
        metadata: {
            token: result
        }
    }
}

const checkLoginEmailTokenService = async ({
    token
}) => {
    try {
        //1. check token in model otp
        const { otp_email: email, otp_token } = await checkEmailToken({ token });

        if(!email) throw new NotFoundError('Token not found');

        //2. check email exits in user model
        const hasUser = await findUserByEmailWithLogin({
            email
        });

        if(hasUser) throw new NotFoundError('Email already exists');
        //new User
        const passwordHash = await bcrypt.hash(email, 10);

        let usr_id = crypto.randomInt(0, Math.pow(2,32));
        let checkUser;
        do{
            checkUser = USER.findOne({
                usr_id 
            })
            usr_id = crypto.randomInt(0, Math.pow(2,32));
        }while(!checkUser);

        const usr_slug = crypto.randomBytes(20).toString('hex');
        const newUser = await USER.create({
            usr_id,
            usr_slug,
            usr_email: email,
            usr_password: passwordHash,
            usr_role: convertToObjectIdMongodb('662f4e5a6ce93b1e6fd37519'),
            usr_status: 'active'
        })

        if(newUser){
            //create privaterKey, publicKey
            const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa',{
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: 'pkcs1',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs1',
                    format: 'pem'
                }
            })
            //Public Key CryptoGrapy Standard 

            const publicKeyString = await KeyTokenService.createKeyToken({
                userId: newUser._id,
                publicKey,
                privateKey
            })

             if(!publicKeyString){

                 throw new BadRequestError('Error: publicKeyString error!')
                // return {
                //     code: 'xxxx',
                //     message: 'publicKeyString error',
                // }
            }

            const publicKeyObject = crypto.createPublicKey(publicKeyString);

             //create token pair
            const tokens = await createTokenPair({userId: newUser._id, email}, publicKeyObject, privateKey);

            return {
                code: '201',
                message: 'verify successfully',
                metadata: {
                    user: getInfoData({ fileds: ['_id','usr_id', 'usr_name', 'usr_email'], object: newUser}),
                    tokens
                }
            }
        }
        return {
            code: '200',
            message: 'verify error',
            metadata: null
        }
    } catch (error) {
        
    }
}

const loginUserService = async ({
    email, password
}) => {
    //1.
    const foundUser = await USER.findOne({ usr_email: email });
    if (!foundUser) throw new BadRequestError('User not registered');
    //2
    const match = await bcrypt.compare(password, foundUser.usr_password);
    if(!match) throw new AuthFailureError('Authentication error');

    //3 
    // create PublicKey, PrivateKey
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa',{
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            }
        })
    //4 = generate tokens
    const {_id: userId} = foundUser;
    const publicKeyString = await KeyTokenService.createKeyToken({
            userId,
            publicKey,
            privateKey
        })
    const publicKeyObject = crypto.createPublicKey(publicKeyString);
    
    const tokens = await createTokenPair({ userId, email}, publicKeyObject, privateKey);

    await KeyTokenService.createKeyToken({
        userId,
        refreshToken: tokens.refreshToken,
        privateKey, publicKey: publicKeyString
    })
    
    return {
        code: '201',
        message: 'Login successfully',
        metadata: {
            user: getInfoData({ fileds: ['_id', 'usr_id', 'usr_name', 'usr_email'], object: foundUser}),
            tokens
        }
    }
}

const updateUserService = async ({
    userId, bodyUpdate
}) => {
    const newUserUpdate = Object.fromEntries(
        Object.entries(bodyUpdate).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );

    if(newUserUpdate.usr_password){
        newUserUpdate.usr_password = await bcrypt.hash(newUserUpdate.usr_password, 10);
        console.log(newUserUpdate.usr_password);
    }
    return await USER.findByIdAndUpdate( userId, newUserUpdate, {new: true})
}

const deleteUserService = async ({
    userId
}) => {
    return await USER.findByIdAndDelete(userId)
}

const findUserByEmailWithLogin = async ({
    email
}) => {
    const user = await USER.findOne({ usr_email: email }).lean();
    return user;
}

const getUserDetailByRefreshToken = async ({ keyStore, user, refreshToken }) => {
    const { userId, email } = user;
    
    if(keyStore.refreshTokenUsed.includes(refreshToken)){
        await KeyTokenService.deleteKeyById(userId);
        throw new ForbiddenError('Something wrong happened !! Pls relogin!!');
    }

    if(keyStore.refreshToken !== refreshToken) throw new AuthFailureError('User not refreshed');
    
    const foundUser = await findUserByEmail({usr_email: email});

    if(!foundUser) throw new AuthFailureError(' User not registered');

    return {
        user: foundUser
    }
}

const findByUserId = async({ userId })=>{
    return await USER.findById(userId);
}

const findByUserShopAll = async()=>{
    const limit = 50, sort = 'ctime', page = 1;
    const roleId = await findRoleIdByName({roleName: 'shop'})
    const filter = {
        usr_status: 'active',
        usr_role: convertToObjectIdMongodb(roleId)
    }
    return await findAllUsers({ limit, sort, page, filter, 
        select: ['_id','usr_first_name', 'usr_last_name', 'usr_email', 'usr_phone', 'usr_sex', 'usr_date_of_birth', 'usr_postal_code','usr_postal_code', 'usr_status']
    });
}

const findByUserAll = async()=>{
    const limit = 50, sort = 'ctime', page = 1
    const filter = {
        usr_status: 'active',
    }
    return await findAllUsers({ limit, sort, page, filter, 
        select: ['_id','usr_first_name', 'usr_last_name', 'usr_email', 'usr_phone', 'usr_sex', 'usr_date_of_birth', 'usr_postal_code','usr_postal_code', 'usr_status']
    });
}

const updateStatusByUserId = async ({ userId, user_status }) => {
    return updateStatusByUser({ userId, user_status })
}

const updatePasswordNewByUserId = async ({ email }) => {
    //1. check email exists in dbs
    const foundUser = await USER.findOne({ usr_email: email }).lean();
    //2. if existing
    if(!foundUser) throw new ErrorResponse('Email cannot exists');

    const {newPassword, user_mail} = await updatePasswordNewByUser({ userId: foundUser._id });
    

    //3. send tokens via email user
    const result = await sendEmailNewPassword({
        email: user_mail,
        password_new: newPassword
    })

    return {
        message: 'verify email user',
        metadata: {
            token: result
        }
    }
}

const updateRoleByUserId = async ({ userId, user_role_new }) => {
    return await updateRoleByUser({ userId, user_role_new});
}

const getRoleByUser = async ({ keyStore, user, refreshToken }) => {
    const { userId, email } = user;
    
    if(keyStore.refreshTokenUsed.includes(refreshToken)){
        await KeyTokenService.deleteKeyById(userId);
        throw new ForbiddenError('Something wrong happened !! Pls relogin!!');
    }

    if(keyStore.refreshToken !== refreshToken) throw new AuthFailureError('User not refreshed');
    
    const foundUser = await findUserByEmail({usr_email: email});

    if(!foundUser) throw new AuthFailureError(' User not registered');

    // console.log(foundUser)
    const role_name = await findRoleByID({roleId: foundUser.usr_role});

    return {
        roleName: role_name,
        userId: foundUser.usr_id
    }
}

const queryUser = async ({ userId }) => {
    // console.log(foundUser)
    const user = await findUserById({userId})

    return {
        user_id: user.usr_id,
        first_name: user.usr_first_name,
        last_name: user.usr_last_name,
        avatar: user.usr_avatar
    }
}

const queryUserById = async ({ userId }) => {
    const user = await USER.findById(userId);

    return {
        user_id: user.usr_id,
        first_name: user.usr_first_name,
        last_name: user.usr_last_name,
        avatar: user.usr_avatar,
        email: user.usr_email
    }
}

const findUserByShop = async ({}) => {
    const roleId = await findRoleIdByName({roleName: 'shop'});

    const listUsers = await USER.find({
        usr_role: roleId
    }).lean();

    return listUsers;
}

const findUserByUser = async ({limit, page}) => {
    const roleId = await findRoleIdByName({roleName: 'user'});

    const skip = (page - 1) * limit;
    const listUsers = await USER.find({
        usr_role: roleId
    }).
    sort({ updateAt: -1 }).
    skip(skip).
    limit(limit).
    lean().
    exec();

    return listUsers;
}

module.exports = {
    newUserService,
    checkLoginEmailTokenService,
    loginUserService,
    updateUserService,
    deleteUserService,
    getUserDetailByRefreshToken,
    findByUserShopAll,
    findByUserAll, 
    findByUserId,
    updateStatusByUserId,
    updatePasswordNewByUserId,
    updateRoleByUserId,
    getRoleByUser,
    queryUser,
    findUserByShop,
    findUserByUser,
    queryUserById
}