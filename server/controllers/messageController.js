import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js"
import { io, userSocketMap } from "../server.js";


export const getUsersForSidebar = async (req, res)=>{
    try {
        const userId = req.user?._id;
        const { search } = req.query;

        let filteredUsers;
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            filteredUsers = await User.find({
                _id: { $ne: userId },
                $or: [
                    { fullName: searchRegex },
                    { email: searchRegex }
                ]
            }).select("-password");
        } else {
            filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");
        }

        // Count number of messages not seen
        const unseenMessages = {}
        const promises = filteredUsers.map(async (user)=>{
            const messages = await Message.find({senderId: user._id, receiverId: userId, seen: false})
            if(messages.length > 0){
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        res.json({success: true, users: filteredUsers, unseenMessages})
    } catch (error) {
        console.error(error.message);
        res.json({success: false, message: error.message})
    }
}

export const getRecentChats = async (req, res) => {
    try {
        const userId = req.user._id;
        // Find all messages where user is sender or receiver
        const messages = await Message.find({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        }).sort({ updatedAt: -1, createdAt: -1 });

        // Map to keep track of last message per user
        const chatMap = new Map();
        messages.forEach(msg => {
            const otherUserId = msg.senderId.equals(userId) ? msg.receiverId.toString() : msg.senderId.toString();
            // Only keep the first occurrence (latest message)
            if (!chatMap.has(otherUserId)) {
                chatMap.set(otherUserId, msg);
            }
        });
        const recentUserIds = Array.from(chatMap.keys());

        // Get user info for all recent chat users
        const users = await User.find({ _id: { $in: recentUserIds } }).select("-password");

        // Count unseen messages from each user
        const unseenMessages = {};
        await Promise.all(users.map(async (user) => {
            const count = await Message.countDocuments({ senderId: user._id, receiverId: userId, seen: false });
            if (count > 0) unseenMessages[user._id] = count;
        }));

        // Order users by last message time
        users.sort((a, b) => {
            const aId = a._id.toString();
            const bId = b._id.toString();
            const aTime = chatMap.get(aId)?.updatedAt || chatMap.get(aId)?.createdAt;
            const bTime = chatMap.get(bId)?.updatedAt || chatMap.get(bId)?.createdAt;
            return new Date(bTime) - new Date(aTime);
        });

        res.json({ success: true, users, unseenMessages });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get all messages for selected user
export const getMessages = async (req, res) =>{
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId},
            ]
        })
        await Message.updateMany({senderId: selectedUserId, receiverId: myId}, {seen: true});

        res.json({success: true, messages})


    } catch (error) {
        console.error(error.message);
        res.json({success: false, message: error.message})
    }
}

// api to mark message as seen using message id
export const markMessageAsSeen = async (req, res)=>{
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, {seen: true})
        res.json({success: true})
    } catch (error) {
        console.error(error.message);
        res.json({success: false, message: error.message})
    }
}

// Send message to selected user
export const sendMessage = async (req, res) =>{
    try {
        const {text, image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        // Emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res.json({success: true, newMessage});

    } catch (error) {
        console.error(error.message);
        res.json({success: false, message: error.message})
    }
}