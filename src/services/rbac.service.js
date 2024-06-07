'use strict';

const RESOURCE = require('../models/resource.model');
const ROLE = require('../models/role.model');

/**
 * new resource
 * @param {string} name
 * @param {string} slug
 * @param {string} description
 */
const createResource = async ({
    name = 'profile', 
    slug = 'p0001', 
    description = ''
}) => {
    try {
        //1. Check name or slug exists

        //2. new resource
        const resource = await RESOURCE.create({
            src_name: name,
            src_slug: slug,
            src_description: description
        })

        return resource;
    } catch (error) {
        
    }
}

const resourceList = async ({
    userID = 0,
    limit = 30,
    offset = 0,
    search = ''
}) => {
    try {
        //1. check admin ? middleware function

        //2. get list od resource
        const resource = await RESOURCE.aggregate([
            {
                $project: {
                    _id: 0,
                    name: '$src_name',
                    slug: '$src_slug',
                    description: '$src_description',
                    resourceID: '$_id',
                    createsAt: 1
                }
            }
        ])
        
        return resource
    } catch (error) {
        return []
    }
}

const createRole = async ({
    name = 'shop',
    slug = 's0001',
    description = 'extend from shop or user',
    grants = []
}) => {
    try {
        //1. check role exists

        //2. nre role
        const role = await ROLE.create({
            rol_name: name,
            rol_slug: slug,
            rol_description: description,
            rol_grants: grants
        })

        return role;
    } catch (error) {
        return error;
    }
}

const roleList = async ({
    userID = 0,
    limit = 30,
    offset = 0,
    search = ''
}) => {
    try {
        //1. userID
        
        //2. list of roles
        const roles = await ROLE.aggregate([
            {
                $unwind: '$rol_grants'
            },
            {
                $lookup: {
                    from: 'Resources',
                    localField: 'rol_grants.resource',
                    foreignField: '_id',
                    as: 'resource'
                }
            },
            {
                $unwind: '$resource',
            },
            {
                $project: {
                    role: '$rol_name',
                    resource: '$resource.src_name',
                    action: '$rol_grants.actions',
                    attributes: '$rol_grants.attributes'
                }
            },
            {
                $unwind: '$action'
            },
            {
                $project: {
                    _id: 0,
                    role: 1,
                    resource: 1,
                    action: '$action',
                    attributes: 1
                }
            }
        ])

        return roles;
    } catch (error) {
        
    }
}

const findRoleIdByName = async ({roleName})=>{
    const role = await ROLE.findOne({rol_name: roleName}).lean();

    return role._id;
}

const findRoleByID = async ({roleId})=>{
    const role = await ROLE.findById(roleId).lean();

    return role.rol_name;
}

module.exports = {
    createResource,
    resourceList,
    createRole,
    roleList,
    findRoleIdByName,
    findRoleByID
}