import { Router } from 'express'
import type { Request, Response } from 'express';
import { RoomModel } from '../models/rooms.js';
import { authMiddleware } from '../middleware/authMIddleware.js';
const RoomRouter = Router()

RoomRouter.post("/create", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body;
    const user = (req as any).user;
    const createdBy = user.id
    if (!name || !type || !createdBy) {
      return res.status(400).json({
        success: false,
        message: "data missing"
      })
    }

    const room = await RoomModel.create({
      name,
      type,
      createdBy,
      members: user.id
    })
    console.log(room)
    return res.status(200).json({
      success: true,
      message: "Room created successfully",
    });
  }
  catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
})


RoomRouter.get('/getRooms', async (req: Request, res: Response) => {
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
// for adding members 
RoomRouter.post('/add-member', authMiddleware,async(req: Request, res: Response)=>{
    try {
      const user = (req as any).user
      const {roomId,userId} = req.body;

      console.log("userID", userId)
      const room = await RoomModel.findByIdAndUpdate(roomId,
        {$addToSet:{
          members:userId
        }},
        {returnDocument: 'after'}
      )
      console.log(room)
      res.json({
        roomId,
        userId
      })
    } catch (error) {
      console.log(error)
    }
})

export default RoomRouter;