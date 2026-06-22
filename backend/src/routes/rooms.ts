import {Router} from 'express'
import type { Request, Response } from 'express';
import { RoomModel } from '../models/rooms.js';
import { authMiddleware } from '../middleware/authMIddleware.js';
const router = Router()

router.post("/rooms",authMiddleware,async (req: Request, res: Response)=>{
    try{
        const {name, type} = req.body;
        const user  = (req as any).user;
        const createdBy = user.id 
        if(!name || !type || !createdBy){
            return res.status(400).json({
                success: false,
                message: "data missing"
            })
        }

     const room =     await RoomModel.create({
            name,
            type,
            createdBy
        })
        return res.status(200).json({
      success: true,
      message: "Room created successfully",
    });
    }
    catch (err){
         console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    }
})


router.get('/getRooms',async (req: Request, res: Response)=>{
   try {
     const rooms = await RoomModel.find({});
    res.json({
        success: true,
        data: rooms
    })
   } catch (err) {
     console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    })
   }
})

export default router;