import { Router } from 'express'
import type { Request, Response } from 'express'
import { UserModel } from '../models/user.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { authMiddleware } from '../middleware/authMIddleware.js'
const AuthRouter = Router()

AuthRouter.post('/register', async (req: Request, res: Response) => {
    const { email, username, password, avatar } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "email not defined"
        })
    }
    if (!username) {
        return res.status(400).json({
            success: false,
            message: "username not defined"
        })
    }
    if (!password) {
        return res.status(400).json({
            success: false,
            message: "password not defined"
        })
    }
    const existingUser = await UserModel.findOne({
        email
    })
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "Email already registered"
        })
    }
    try {
        const user = await UserModel.create({
            email,
            username,
            passwordHash: await bcrypt.hash(password, 10),
            avatar
        })

        return res.status(201).json({
            success: true,
            message: "user created successfully"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "internal server error"
        })
    }
})


// login route

AuthRouter.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "email not defined"
        })
    }
    if (!password) {
        return res.status(400).json({
            success: false,
            message: "password not defined"
        })
    }

    const user = await UserModel.findOne({ email })
    if (!user) {
        return res.status(400).json({
            success: false,
            message: "Email not registered yet"
        })
    }

    const checkPassword = await bcrypt.compare(password, user.passwordHash)
    if (!checkPassword) {
        return res.status(400).json({
            success: false,
            message: "Invalid credentials"
        })
    }
    const token = jwt.sign(
        {
            id: user._id,
            email: user.email
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' }
    )
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax'
    })
    return res.status(200).json({
        success: true,
        message: "login successful"
    })
})

AuthRouter.get("/me", authMiddleware, (req: Request, res: Response) => {
    const user = (req as any).user;
    return res.status(200).json({
        success: true,
        user
    })
})


export default AuthRouter
