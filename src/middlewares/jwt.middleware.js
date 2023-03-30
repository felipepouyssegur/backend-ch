import jwt from 'jsonwebtoken'

export function jwtValidation(req, res, next) {
    const authHeader = req.get('Authorization')
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    try {
        const decodedToken = jwt.verify(token, 'secretJWT')
        req.username = decodedToken.username
        next()
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' })
    }
}