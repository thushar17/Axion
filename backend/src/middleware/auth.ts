import type { Request, Response, NextFunction } from "express"
import { verify } from 'jsonwebtoken'

export const authMiddleware = async(req:Request , res:Response , next:NextFunction)=>{
    const token = req.cookies.token
    const jwtSecret = process.env.JWT_SECRET

    if(!token){
        return  res.status(401).json({ error: 'Unauthorized' })
    }
    if(!jwtSecret){
        return res.status(500).json({ error: 'JWT secret not configured' })
    }
   try {
     const decoded = verify(token , jwtSecret);
      
       (req as any).user = decoded
      next()
   } catch (error) {
    console.log(error)
    res.status(401).json({
        success:false,
        message: "You are not authorized"
    })
   }
    
}
