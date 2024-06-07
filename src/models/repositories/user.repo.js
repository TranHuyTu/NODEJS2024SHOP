'use strict';

const { getSelectData, convertToObjectIdMongodb } = require('../../utils');
const USER = require('../user.model');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { NotFoundError } = require('../../core/error.response');
const { findRoleIdByName } = require('../../services/rbac.service');

const createUser = async({
    usr_id,
    usr_slug,
    usr_name,
    usr_password,
    usr_role
}) => {
    const user = await USER.create({
            usr_id,
            usr_name,
            usr_slug,
            usr_password,
            usr_role
        })
        
    return user;
}

const findUserByEmail = async({
    usr_email
})=>{
    return await USER.findOne({usr_email}).lean();
}

const findUserById = async({
    userId
})=>{
    return await USER.findOne({ usr_id: userId }).lean();
}

const findAllUsers = async ({ limit, sort, page, filter, select })=>{
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1};
    const user = await USER.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();

    return user;
}

//Update status of user
const updateStatusByUser = async ({ userId, user_status }) => {
    const updateOrInsert = {
        usr_status: user_status
    }, options = { upsert: true, new: true};

    return await USER.findByIdAndUpdate( userId, updateOrInsert, options );
}

//Update password new 
const updatePasswordNewByUser = async ({ userId }) => {
    const passwordLength = 12;

    const newPassword = crypto.randomBytes(Math.ceil(passwordLength / 2)).toString('hex').slice(0, passwordLength);

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updateOrInsert = {
        usr_password: passwordHash
    }, options = { upsert: true, new: true};
    
    const userUpdate = await USER.findByIdAndUpdate( userId, updateOrInsert, options );

    if(!userUpdate) throw new NotFoundError('User not found');

    // Send to mail user

    return {
        newPassword,
        user_mail: userUpdate.usr_email
    };
}

//update role user
const updateRoleByUser = async ({ userId, user_role_new }) => {
    const roleId = await findRoleIdByName({roleName: user_role_new})
    const updateOrInsert = {
        usr_role: convertToObjectIdMongodb(roleId)
    }, options = { upsert: true, new: true};
    
    return await USER.findByIdAndUpdate( userId, updateOrInsert, options );
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    findAllUsers,
    updateStatusByUser,
    updatePasswordNewByUser,
    updateRoleByUser
}