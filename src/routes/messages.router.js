import { Router } from "express";
import { transporter } from "../nodemailer.js";
import { __dirname } from "../utils.js";
import config from "../config.js";
import { client } from "../messenger/twilio.js";

const router = Router()

router.get('/', async (req, res) => {
    await transporter.sendMail({
        from: 'CODERHOUSE',
        to: 'pipe071951@gmail.com',
        subject: 'PRUEBA CODERHOUSE',
        /* text: 'Mi primer mail :D!' */
        html: '<h1>Informacion de CoderHouse</h1>',
        attachments: [
            {
                path: __dirname + ''
            }
        ]
    })
    res.send('Email sent')
})


router.get('/twilio', async (req, res) => {
    await client.messages.create({
        body: 'HOLA PAU!!!! :D',
        from: config.twilio_phone_number,
        to: '+5492235929314'
    })

    res.send('Probando twilio')
})

export default router