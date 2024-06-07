'use strict'

const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: "tranhuytu37@gmail.com",
        pass: "krghbudzxfvxlach"
    }
})

module.exports = transport