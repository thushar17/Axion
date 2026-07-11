import { Router } from 'express'
import type { Request, Response } from 'express'
import { UserModel } from '../models/user.js'
import { MessageModel } from '../models/messages.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { uploadAvatar } from '../config/cloudinary.js'
import { getIO } from '../socket/index.js'
import { OAuth2Client } from 'google-auth-library'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
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
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 1 day, matches your JWT expiresIn
})
    return res.status(200).json({
        token,
        success: true,
        message: "login successful"
    })
})

AuthRouter.post("/google", async (req: Request, res: Response) => {
    const { credential } = req.body;
    if (!credential) {
        return res.status(400).json({ success: false, message: "Credential not provided" });
    }
    
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        if (!payload || !payload.email) {
            return res.status(400).json({ success: false, message: "Invalid Google token" });
        }
        
        const { email, name, picture, sub: googleId } = payload;
        
        let user = await UserModel.findOne({ email });
        
        if (!user) {
            // Create user
            user = await UserModel.create({
                email,
                username: name || email.split('@')[0],
                avatar: picture,
                googleId
            });
        } else if (!user.googleId) {
            // Link google account to existing user
            user.googleId = googleId;
            if (!user.avatar) user.avatar = picture;
            await user.save();
        }
        
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '1d' }
        );
        
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
        });
        
        return res.status(200).json({
            token,
            success: true,
            message: "Google login successful"
        });
        
    } catch (error) {
        console.error("Google auth error:", error);
        return res.status(500).json({ success: false, message: "Failed to authenticate with Google" });
    }
});

AuthRouter.get("/me", authMiddleware, async (req:Request, res: Response) => {
    const user = req.user;
    if (!user) {
    return res.status(401).json({
        message: "Unauthorized"
    });
}
    const dbUser = await UserModel.findById(user.id);
    if (!dbUser) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({
        success: true,
        user: {
            id: dbUser._id,
            email: dbUser.email,
            username: dbUser.username,
            avatar: dbUser.avatar,
            starredMessages: dbUser.starredMessages || [],
            mutedRooms: dbUser.mutedRooms || [],
            archivedRooms: dbUser.archivedRooms || [],
            clearedRooms: dbUser.clearedRooms || []
        }
    })
})

AuthRouter.post("/star-message", authMiddleware, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const userId = req.user.id;
        const { messageId } = req.body;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isStarred = user.starredMessages.includes(messageId as any);
        if (isStarred) {
            user.starredMessages = user.starredMessages.filter(id => id.toString() !== messageId);
        } else {
            user.starredMessages.push(messageId as any);
        }

        await user.save();

        return res.status(200).json({
            success: true,
            isStarred: !isStarred,
            starredMessages: user.starredMessages
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

AuthRouter.get("/starred-messages", authMiddleware, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const userId = req.user.id;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const messages = await MessageModel.find({
            _id: { $in: user.starredMessages }
        }).populate("sender", "username email avatar");

        return res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

AuthRouter.post("/mute-room", authMiddleware, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const userId = req.user.id;
        const { roomId } = req.body;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMuted = user.mutedRooms.includes(roomId as any);
        if (isMuted) {
            user.mutedRooms = user.mutedRooms.filter(id => id.toString() !== roomId);
        } else {
            user.mutedRooms.push(roomId as any);
        }

        await user.save();

        return res.status(200).json({
            success: true,
            isMuted: !isMuted,
            mutedRooms: user.mutedRooms
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

AuthRouter.post("/archive-room", authMiddleware, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const userId = req.user.id;
        const { roomId } = req.body;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isArchived = user.archivedRooms.includes(roomId as any);
        if (isArchived) {
            user.archivedRooms = user.archivedRooms.filter(id => id.toString() !== roomId);
        } else {
            user.archivedRooms.push(roomId as any);
        }

        await user.save();

        return res.status(200).json({
            success: true,
            isArchived: !isArchived,
            archivedRooms: user.archivedRooms
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

AuthRouter.post("/clear-chat", authMiddleware, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const userId = req.user.id;
        const { roomId } = req.body;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const clearedEntryIndex = user.clearedRooms.findIndex(c => c.roomId?.toString() === roomId);
        if (clearedEntryIndex !== -1) {
            const entry = user.clearedRooms[clearedEntryIndex];
            if (entry) {
                entry.clearedAt = new Date();
            }
        } else {
            user.clearedRooms.push({
                roomId: roomId as any,
                clearedAt: new Date()
            });
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Chat history cleared successfully",
            clearedRooms: user.clearedRooms
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

AuthRouter.put("/update-profile", authMiddleware, uploadAvatar.single('avatar'), async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        
        const userId = req.user.id;
        const { username } = req.body;
        
        const updateData: any = {};
        if (username) updateData.username = username;
        if (req.file) updateData.avatar = req.file.path; // multer-storage-cloudinary provides the URL in req.file.path
        
        const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });
        
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const userData = {
            id: updatedUser._id,
            email: updatedUser.email,
            username: updatedUser.username,
            avatar: updatedUser.avatar,
            starredMessages: updatedUser.starredMessages || [],
            mutedRooms: updatedUser.mutedRooms || [],
            archivedRooms: updatedUser.archivedRooms || [],
            clearedRooms: updatedUser.clearedRooms || []
        };

        const io = getIO();
        io.emit("user_updated", userData);

        return res.status(200).json({
            success: true,
            user: userData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

export default AuthRouter;
