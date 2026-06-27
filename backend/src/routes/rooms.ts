import { Router } from 'express'
import type { Request, Response } from 'express';
import { RoomModel } from '../models/rooms.js';
import { authMiddleware } from '../middleware/authMIddleware.js';
import { UserModel } from '../models/user.js';
import { checkForUserRole } from '../helpers/roomPermission.js';
import { Types } from 'mongoose';
import { getIO } from '../socket/index.js';
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
      members: [{
        user: user.id,
        role: 'admin'
      }]
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


RoomRouter.get('/getRooms', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const rooms = await RoomModel.find({
      "members.user": user.id
    });
    
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
      if (!userDetail) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
      const userId = userDetail._id
      
      const room = await RoomModel.findOneAndUpdate({
        _id: roomId,
        'members.user': {$ne: userId}
      },

        {$addToSet:{
          members:{
            user: userId,
            role: "member"
          }
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
      const room = await RoomModel.findById(roomId).populate("members.user","email , status and username")
      
      
      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }

      res.status(200).json({
        success: true,
        // members: room.members,
        members: room.members
      });
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Internal server error"
      })
    }
    
})

RoomRouter.delete('/remove-member',authMiddleware, async (req:Request, res: Response)=>{
    try {
      const{ roomId, memberId} = req.body;
      const user = req.user;
     if (!user) {
    return res.status(401).json({
        message: "Unauthorized"
    })}; 
      const role = await checkForUserRole(roomId, user.id)
      if(!role || role!== 'admin'){
        return res.status(403).json({
          success:false,
          message: "Only admins can Remove members"
        })
      }
      if(memberId === user.id ){
         return res.status(400).json({
          success: false,
          message: 'You cannot remove yourself'
         })
        }
     // removing member 
        const removedMember = await RoomModel.findOneAndUpdate(
          {
            _id: roomId,
            'members.user': new Types.ObjectId(memberId)
          },{
            $pull:{
                members: {user: new Types.ObjectId(memberId)} 
            }
          },{
            new: true
          }
        )

        const io = getIO();
        io.to(roomId).emit('member-removed',{
          roomId,
          memberId
        })

        
        res.status(200).json({
          success: true,
          message:'member removed sucessfully',
          removedMember
        })
      
      
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        messsage: 'Server error'
      })
    }
})

export default RoomRouter;