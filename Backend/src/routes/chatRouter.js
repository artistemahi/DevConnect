const express = require("express");
const chatRouter = express.Router();
const ChatModel = require("../models/chat");
const { UserAuth } = require("./../middleware/auth");

// return one user and latest message of the chat
chatRouter.get("/conversations", UserAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const chats = await ChatModel.find({
      participants: loggedInUserId,
    })
      .populate("participants", "firstName lastName photoURL")
      .sort({ updatedAt: -1 });

    const conversations = chats.map((chat) => {
      // Find the other user
      const otherUser = chat.participants.find(
        (user) => user._id.toString() !== loggedInUserId.toString()
      );

      const lastMessage =
        chat.messages.length > 0
          ? chat.messages[chat.messages.length - 1].text
          : "";

      return {
        user: otherUser,
        lastMessage,
        updatedAt: chat.updatedAt,
      };
    });

    res.json(conversations);
  } catch (err) {
    res.status(500).send("ERROR : " + err.message);
  }
});

// Get chat messages between two users
chatRouter.get("/:targetUserId", UserAuth, async (req, res) => {
  try {
    const targetUserId = req.params.targetUserId;
    const loggedInUserId = req.user._id;

    // Find the chat between the two users
    const chat = await ChatModel.findOne({
      participants: { $all: [targetUserId, loggedInUserId] },
    }).populate({path:"messages.sender", select: "firstName lastName photoURL"});
    
    if (!chat) {
      return res.status(404).json({ message: "No chat found between the users" });
    }
    res.status(200).json(chat);
   }catch(err){
     console.error(err);
     res.status(500).json({ message: "Internal server error" });
   }
});
module.exports = chatRouter;