import {Schema, model} from 'mongoose'

const UserSchema = new Schema({
    email:{
        type: String,
        required:true,
        unique: true
    },
    username:{
        type: String,
        required:true,
        unique: true
    },
    passwordHash:{
        type: String,
        required:true
    },
    avatar:{
        type:String
    },
    status:{
        type: String,
        enum:["online","offline"],
        default: "offline"
    },
    lastSeen:{
        type: Date
    }

})

export const UserModel = model("User", UserSchema);