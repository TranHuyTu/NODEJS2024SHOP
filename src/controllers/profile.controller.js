'use strict';

const {
    SuccessResponse
} = require('../core/success.response');

const dataProfiles = [
    {
        usr_id: 1,
        usr_name: 'CR7',
        usr_avt: 'image.com/image'
    },
    {
        usr_id: 2,
        usr_name: 'M10',
        usr_avt: 'image.com/image'
    },
    {
        usr_id: 3,
        usr_name: 'TIPJS',
        usr_avt: 'image.com/image'
    }
]

class ProfileController{

    //admin
    profiles = async (req, res, next) => {
        new SuccessResponse({
            message: 'view all profiles',
            metadata: dataProfiles
        }).send(res);
    }

    profile = async (req, res, next) => {
        new SuccessResponse({
            message: 'view One profile',
            metadata: {
                usr_id: 3,
                usr_name: 'TIPJS',
                usr_avt: 'image.com/image'
            }
        }).send(res);
    }
}

module.exports = new ProfileController();