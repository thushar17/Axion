import { Router } from 'express'
import type { Request, Response } from 'express';
import { RoomModel } from '../models/rooms.js';
import { authMiddleware } from '../middleware/authMIddleware.js';
import { UserModel } from '../models/user.js';
const RoomRouter = Router()

RoomRouter.post("/create", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body;
    const user = req.user;
     if (!user) {
    return res.status(401).json({
        message: "Unauthorized"
    })}; 
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
      members: [user.id]
    })
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
      const {email,roomId} = req.body
      const userDetail = await UserModel.findOne({email: email})
      const userId = (userDetail as any)._id
      
      const room = await RoomModel.findByIdAndUpdate({
        _id: roomId,
        members: {$ne: userId}
      },

        {$addToSet:{
          members:userId
        }},
        {returnDocument: 'after'}
      )
      if(!room){
        return res.status(400).json({
          success: true,
          message: "User is alreay member in room or room doesn't exist"
        })
      }
      res.status(200).json({
        success: true,
        message: "member added successfully"
      })
    } catch (error) {
      console.log(error)
    }
})

// fetching members of room
RoomRouter.get('/:roomId/members',authMiddleware,async (req:Request, res:Response)=>{
    try {
      const {roomId} = req.params;
      const room = await RoomModel.findById(roomId).populate("members","email, username and status")
      
      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }

      res.status(200).json({
        success: true,
        members: room.members,
      });
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Internal server error"
      })
    }
    
})

export default RoomRouter;