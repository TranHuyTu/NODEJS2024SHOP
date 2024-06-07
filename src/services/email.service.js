'use strict';

const { newOTP } = require('./otp.service');
const { getTemplate } = require('./template.service');
const transport = require('../dbs/init.nodemailer');
const { NotFoundError } = require('../core/error.response');
const { replacePlaceholder } = require('../utils');


const sendEmailLinkVerify = async({
    html,
    toEmail,
    subject = 'Xac nhan Email dang ky',
    text = 'xac nhan ...'
}) => {
    try {
        const mailOptions = {
            from: ' "ShopDEV" <tranhuytu37@gmail.com>',
            to: toEmail,
            subject,
            text,
            html
        }

        await transport.sendMail( mailOptions, ( err, info ) => {
            if ( err ) {
                return console.log( err );
            } 

            console.log( 'Message sent::' , info.messageId );
        })
    } catch (error) {
        console.error('error sending mail', error);
        return error;
    }
}

const sendEmailToken = async ({
    email = null
}) => {
    try {
        //1.  get token
        const token = await newOTP({ email });

        //2.get Template
        const template = await getTemplate({
            tem_name: 'HTML EMAIL TOKEN'
        })

        if( !template ){
            throw new NotFoundError('Template not found');
        }

        //3. replace placeholder with params 
        const content = replacePlaceholder(
            template.tem_html,
            {
                link_verify: token.otp_token.toString()
            }
        )

        //4. send email


        sendEmailLinkVerify({
            html: content,
            toEmail: email,
            subject: 'Vui long xac nhan dia chi Email dang ki shopDEV.com'
        }).catch(err => console.error(err));

        return 1;
    } catch (error) {
        
    }
}

const sendEmailNewPassword = async ({
    email = null,
    password_new = ''
}) => {
    try {
        //2.get Template
        const template = await getTemplate({
            tem_name: 'HTML EMAIL TOKEN'
        })

        if( !template ){
            throw new NotFoundError('Template not found');
        }

        //3. replace placeholder with params 
        const content = replacePlaceholder(
            template.tem_html,
            {
                link_verify: `${password_new}`
            }
        )

        //4. send email


        sendEmailLinkVerify({
            html: content,
            toEmail: email,
            subject: 'Vui long xac nhan mật khẩu mới của shopDEV.com'
        }).catch(err => console.error(err));

        return 1;
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    sendEmailToken,
    sendEmailNewPassword
}