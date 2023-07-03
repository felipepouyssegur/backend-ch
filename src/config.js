import dotenv from 'dotenv'

dotenv.config()

export default {
    port: process.env.PORT,

    gmail_password: process.env.GMAIL_PASSWORD,
    gmail_user: process.env.GMAIL_USER,

    twilio_phone_number: process.env.TWILIO_PHONE_NUMBER,
    twilio_sid: process.env.TWILIO_SID,
    twilio_auth_token: process.env.TWILIO_AUTH_TOKEN,

    stripe_public_key: process.env.STRIPE_PUBLIC_KEY,
    stripe_private_key: process.env.STRIPE_PRIVATE_KEY,

    mongo_uri: process.env.MONGO_URI
}