import { Worker } from "bullmq";
import { bullConnection } from "../lib/bullmq.js";
import { MessageModel } from "../models/messages.js";
import { extractMentions } from "../helpers/extractMentions.js";
import { UserModel } from "../models/user.js";
import { notificationModel } from "../models/notification.js";

export const notificationWorker = new Worker(
    "notification",
    async(job)=> {
        switch(job.name){
            case 'new-message':
              const {messageId} = job.data
              const message = await MessageModel.findById(messageId)
              if(!message){
                return
              }
              const mentions = extractMentions(message.content)
              const users = await UserModel.find({
                username:{
                    $in: mentions
                }
              })

              if(!users) return
            
              for(const user of users){
                if(user._id.toString() === message.sender.toString()){

                    continue;
                }
                
                 await notificationModel.create({
                     recipient: user._id,
                     sender: message.sender,
                     type: "mention",
                     roomId: message.roomId,
                     messageId: message._id
                 })
              }
            break;

            default:
            console.log("Unknown job:", job.name);
        }
    },
    {
        connection: bullConnection as any
    }
)
