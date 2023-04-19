import nodemailer from 'nodemailer'
import config from './config.js';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.gmail_user, // generated ethereal user
        pass: config.gmail_password, // generated ethereal password
    },
});
