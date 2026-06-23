import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { config } from 'dotenv'

config()

const JWT_SECRET = process.env.JWT_SECRET

export async function hashPassword(plainPassword) {
    try {
        return await bcrypt.hash(plainPassword, 10)
    } catch (err) {
        console.error('Greška hashiranja:', err)
        return null
    }
}

export async function checkPassword(plainPassword, hashedPassword) {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword)
    } catch (err) {
        console.error('Greška usporedbe:', err)
        return false
    }
}

export async function generateJWT(payload) {
    try {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
    } catch (err) {
        console.error('Greška generiranja JWT:', err)
        return null
    }
}

export async function verifyJWT(token) {
    try {
        return jwt.verify(token, JWT_SECRET)
    } catch (err) {
        return null
    }
}

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).json({ error: 'Neautoriziran zahtjev' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = await verifyJWT(token)
    if (!decoded) {
        return res.status(401).json({ error: 'Nevaljan ili istekli token' })
    }
    req.authorised_user = decoded
    next()
}
