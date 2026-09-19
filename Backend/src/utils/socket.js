const UserModel = require("./../models/user");
const ChatModel = require("./../models/chat");
const socket = require("socket.io");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a private chat room
    socket.on("joinChat", ({ firstName, targetUserId, loggedInUserId }) => {
      const roomID = [targetUserId, loggedInUserId].sort().join("-");

      socket.join(roomID);

      console.log(`${firstName} joined room ${roomID}`);
    });

    // Send message
    socket.on(
      "sendMessages",
      async ({ firstName, targetUserId, loggedInUserId, chatMessages }) => {
        try {
          const roomID = [targetUserId, loggedInUserId].sort().join("-");

          // Find sender
          const sender = await UserModel.findById(loggedInUserId).select(
            "_id firstName lastName photoURL"
          );

          if (!sender) {
            return;
          }

          // Find existing conversation
          let chat = await ChatModel.findOne({
            participants: {
              $all: [loggedInUserId, targetUserId],
            },
          });

          // Create conversation if it doesn't exist
          if (!chat) {
            chat = new ChatModel({
              participants: [loggedInUserId, targetUserId],
              messages: [],
            });
          }

          // Create new message
          const newMessage = {
            sender: loggedInUserId,
            text: chatMessages,
          };

          // Add message to conversation
          chat.messages.push(newMessage);

          // Save conversation and message to MongoDB
          await chat.save();

          // Get the message after MongoDB has created its _id and timestamps
          const savedMessage =
            chat.messages[chat.messages.length - 1];

          // Send the saved message to everyone in this chat room
          io.to(roomID).emit("receiveMessage", {
            sender,
            chatMessages: savedMessage,
          });

          console.log(`${firstName} sent: ${chatMessages}`);
        } catch (err) {
          console.error("Error sending message:", err);
        }
      }
    );

    // User disconnected
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = initializeSocket;