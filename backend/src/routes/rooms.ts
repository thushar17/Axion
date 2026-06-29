import { response, Router } from 'express'
import type { Request, Response } from 'express';
import { RoomModel } from '../models/rooms.js';
import { authMiddleware } from '../middleware/authMIddleware.js';
import { UserModel } from '../models/user.js';
import { checkForUserRole } from '../helpers/roomPermission.js';
import { Types } from 'mongoose';
import { getIO } from '../socket/index.js';
const RoomRouter = Router()
import { generateInviteCode } from '../helpers/generateInviteCode.js';
import { success } from 'zod';
import { MessageModel } from '../models/messages.js';
RoomRouter.post("/create", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body;
    console.log("lhello how are you", name, type)
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
// remove member 
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

// genreate invite link
RoomRouter.post("/generate-invite", authMiddleware , async (req: Request, res: Response)=>{
    try {
      const user = req.user
      if(!user){
        return res.status(400).json({
          success: false,
          message: 'Unauthorized'
        })
      }
      const userId = user.id
      const {roomId} = req.body
      
      const isAdmin = await checkForUserRole(roomId, userId)
      
      if (isAdmin !== 'admin') {
         return res.status(403).json({ success: false, message: "Only admins can generate invite links" })
      }

      const inviteCode = generateInviteCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1); 
      const room = await RoomModel.findOneAndUpdate(
        { _id: roomId },
        { 
           inviteLink: inviteCode,
           inviteLinkExpiresAt: expiresAt 
        },
        { new: true }
      );

      if (!room) {
        return res.status(404).json({ success: false, message: "Room not found" });
      }

      res.status(200).json({
        success: true,
        inviteLink: `http://localhost:3000/invite/${room.inviteLink}`
      })
      

    } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: "Internal server error" })
    }
});

// join room by invite link

 RoomRouter.post('/join-invite',authMiddleware, async (req: Request, res: Response)=>{
       try {
         if(!req.user){
            return res.status(401).json({
              success: false ,
              message: 'Unauthorized'
            })
          }
          const userId = req.user.id 
          const {inviteCode} = req.body;
          const room = await RoomModel.findOne({inviteLink: inviteCode});
          if(!room){
            return res.json({
              success: false,
              message: 'room not found'
            })
          }
          if (room.inviteLinkExpiresAt && new Date() > room.inviteLinkExpiresAt) {
            return res.status(400).json({
              success: false,
              message: 'Invite link has expired'
            });
          }
          const alreadyMember = room.members.some(member =>
    member.user.equals(userId)
);
if (alreadyMember) {
    return res.status(400).json({
        success: false,
        message: "Already a member."
    });
}

  room.members.push({
     user: userId,
     role: 'member'
  })

  await room.save()

return res.status(200).json({
    success: true,
    message: "Joined room successfully",
    room
});
      
          
       } catch (error) {
         console.error(error)
         res.json({
          success: false,
          message: 'Server Error'
         })
       }
 })

 // delete room 
 RoomRouter.delete("/delete",authMiddleware,async (req : Request, res: Response)=>{
    try {
      if(!req.user){
        return res.status(401).json({
           success: false,
           message: "User not authorized"
        })
      }
      const userId = req.user.id 
      const {roomId} = req.body
      const admin = await checkForUserRole(roomId, userId)
     if(admin !== "admin"){
      return res.status(400).json({
         success: false,
         message: 'Only admins can delete rooms'
      })
     }

     const room = await RoomModel.findByIdAndDelete(roomId)
     
     if(!room){
      return res.status(400).json({
        success: false,
        message: "room not found"
      })
     }
           const io = getIO();
      io.to(roomId).emit("room-deleted",{
       roomId
      })
       
      return res.status(200).json({
        success: true,
        message: 'Room deleted succcesfully'
      })
      
    } catch (error) {
       console.error(error)
       res.status(500).json({ success: false, message: "Internal server error" })
    }
 })

 //  edit message route

 RoomRouter.post("/edit-message",authMiddleware,async(req:Request, res: Response)=>{
  try {
       if(!req.user){
        return res.status(401).json({
           success: false,
           message: "User not authorized"
        })
      }
     const userId = req.user.id
     
     const {messageId, messageContent} = req.body
     if (!messageContent?.trim()) {
  return res.status(400).json({
    success: false,
    message: "Message cannot be empty"
  });
}

     const message = await MessageModel.findById(messageId)
     if(!message){
      return res.status(400).json({
        success: false,
        message: "message not found in database"
      }) }

      if(message.sender.toString() !== userId){
          return res.status(403).json({
            success: false,
            message: "You are not owner of this message"
          })
      }
     if (message.content === messageContent.trim()) {
  return res.status(400).json({
    success: false,
    message: "No changes detected"
  });
}
    message.content = messageContent.trim()
    message.isEdited = true 
    
    await message.save()

    const io = getIO()

    io.to(message.roomId.toString()).emit("message-edit",{
       messageId: message._id,
       content : message.content,
       isEdited: true
    })
    res.status(200).json({
         success: true, 
         message
    })
       
     
  } catch (error) {
    
  }
 })

 // delete message route (soft delete)
 RoomRouter.post("/delete-message", authMiddleware, async (req: Request, res: Response) => {
   try {
     if (!req.user) {
       return res.status(401).json({
         success: false,
         message: "User not authorized"
       });
     }
     const userId = req.user.id;
     const { messageId } = req.body;

     const message = await MessageModel.findById(messageId);
     if (!message) {
       return res.status(400).json({
         success: false,
         message: "Message not found"
       });
     }

     if (message.sender.toString() !== userId) {
       return res.status(403).json({
         success: false,
         message: "Only the sender can delete this message"
       });
     }

     message.isDeleted = true;
     message.content = "This message was deleted";
     await message.save();

     const io = getIO();
     io.to(message.roomId.toString()).emit("message-deleted", {
       messageId: message._id,
       content: message.content,
       isDeleted: true
     });

     res.status(200).json({
       success: true,
       message
     });
   } catch (error) {
     console.error(error);
     res.status(500).json({
       success: false,
       message: "Internal server error"
     });
   }
 });

 // pin message route
 RoomRouter.post("/pin-message", authMiddleware, async (req: Request, res: Response) => {
   try {
     if (!req.user) {
       return res.status(401).json({
         success: false,
         message: "User not authorized"
       });
     }
     const userId = req.user.id;
     const { messageId, isPinned } = req.body;

     const message = await MessageModel.findById(messageId);
     if (!message) {
       return res.status(400).json({
         success: false,
         message: "Message not found"
       });
     }

     const role = await checkForUserRole(message.roomId, userId);
     if (role !== "admin") {
       return res.status(403).json({
         success: false,
         message: "Only admins can pin or unpin messages"
       });
     }

     message.isPinned = isPinned;
     await message.save();

     const io = getIO();
     io.to(message.roomId.toString()).emit("message-pinned", {
       messageId: message._id,
       isPinned: message.isPinned
     });

     res.status(200).json({
       success: true,
       message
     });
   } catch (error) {
     console.error(error);
     res.status(500).json({
       success: false,
       message: "Internal server error"
     });
   }
 });

 // rename room route
 RoomRouter.post("/rename", authMiddleware, async (req: Request, res: Response) => {
   try {
     if (!req.user) {
       return res.status(401).json({
         success: false,
         message: "User not authorized"
       });
     }
     const userId = req.user.id;
     const { roomId, newName } = req.body;

     if (!newName?.trim()) {
       return res.status(400).json({
         success: false,
         message: "Room name cannot be empty"
       });
     }

     const role = await checkForUserRole(roomId, userId);
     if (role !== "admin") {
       return res.status(403).json({
         success: false,
         message: "Only admins can rename rooms"
       });
     }

     const room = await RoomModel.findByIdAndUpdate(
       roomId,
       { name: newName.trim() },
       { new: true }
     );

     if (!room) {
       return res.status(400).json({
         success: false,
         message: "Room not found"
       });
     }

     const io = getIO();
     io.to(roomId).emit("room-renamed", {
       roomId,
       newName: room.name
     });

     res.status(200).json({
       success: true,
       room
     });
   } catch (error) {
     console.error(error);
     res.status(500).json({
       success: false,
       message: "Internal server error"
     });
   }
 });

 // leave room route
 RoomRouter.post("/leave", authMiddleware, async (req: Request, res: Response) => {
   try {
     if (!req.user) {
       return res.status(401).json({
         success: false,
         message: "User not authorized"
       });
     }
     const userId = req.user.id;
     const { roomId } = req.body;

     const room = await RoomModel.findById(roomId);
     if (!room) {
       return res.status(400).json({
         success: false,
         message: "Room not found"
       });
     }

     const memberIndex = room.members.findIndex(m => m.user.toString() === userId);
     if (memberIndex === -1) {
       return res.status(400).json({
         success: false,
         message: "You are not a member of this room"
       });
     }

     const member = room.members[memberIndex];
     if (!member) {
       return res.status(400).json({
         success: false,
         message: "You are not a member of this room"
       });
     }

     const userRole = member.role;
     if (userRole === "admin") {
       const admins = room.members.filter(m => m.role === "admin");
       if (admins.length === 1) {
         return res.status(400).json({
           success: false,
           message: "You cannot leave because you are the last admin. Promote another member or delete the room."
         });
       }
     }

     room.members.splice(memberIndex, 1);
     await room.save();

     const io = getIO();
     io.to(roomId).emit("member-removed", {
       roomId,
       memberId: userId
     });

     res.status(200).json({
       success: true,
       message: "Left room successfully"
     });
   } catch (error) {
     console.error(error);
     res.status(500).json({
       success: false,
       message: "Internal server error"
     });
   }
 });

 //  message reaction toggle 


RoomRouter.post("/messages/toggle-reaction",authMiddleware,async (req: Request, res: Response)=>{
    try {
      
    } catch (error) {
      
    }
})

export default RoomRouter;