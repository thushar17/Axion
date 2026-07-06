import type { Request, Response, NextFunction } from "express"
import jwt, { type JwtPayload } from 'jsonwebtoken'
import type { JwtUserPayload } from "../types/index.js"
export const authMiddleware = async(req:Request , res:Response , next:NextFunction)=>{
    let token = req.cookies.token;
    // if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    //     token = req.headers.authorization.split(' ')[1];
    // }

    if(!token){
        return  res.status(401).json({ error: 'Unauthorized' })
    }
   try {
     const decoded = jwt.verify(token,process.env.JWT_SECRET as string) as JwtUserPayload ;
     req.user = decoded ;                                                                                                                                                                                 
      next()
   } catch (error) {
    console.log(error)
    res.status(401).json({
        success:false,
        message: "You are not authorized"
    })
   }
    
}