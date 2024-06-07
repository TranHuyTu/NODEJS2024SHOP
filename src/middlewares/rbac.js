'use strict';

const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { roleList, findRoleByID } = require('../services/rbac.service');
const { getUserDetailByRefreshToken } = require('../services/user.service');
const rbac = require('./role.middlewares');

const grantAccess = (action, resource) => {

    return async (req, res, next) => {
        try {
            const user = await getUserDetailByRefreshToken({
                refreshToken: req.headers['x-rtoken-id'],
                user: req.user,
                keyStore: req.keyStore,
            })

            if(!user) {
                throw new AuthFailureError(`you don'n have enough permissions`);
            }

            const role_Name = await findRoleByID({roleId: user.user.usr_role});
            rbac.setGrants( await roleList({
                userID: user.usr_id
            }));
            const rol_name = role_Name;
            const permission = rbac.can(rol_name)[action](resource);
            if(!permission.granted){
                throw new AuthFailureError(`you don'n have enough permissions`);
            }

            next();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = {
    grantAccess
}