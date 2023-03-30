import { dirname } from 'path'
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';

export const __dirname = dirname(fileURLToPath(import.meta.url))

export const hashData = async (data) => {
    return bcrypt.hash(data, 10)
}

export const compareHashedData = async (data, hashedData) => {
    return bcrypt.compare(data, hashedData)
}

export const generateToken = (user) => {
    return jwt.sign({ user }, 'secretJWT', { expiresIn: '24h' })
}