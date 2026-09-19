const UserModel = require("./../models/user");
const socket = require("socket.io");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {

    socket.on("joinChat", ({ firstName, targetUserId, loggedInUserId }) => {
      const roomID = [targetUserId, loggedInUserId].sort().join("-");

      socket.join(roomID);

      console.log(`${firstName} joined room ${roomID}`);
    });

    socket.on(
      "sendMessages",
      async ({ firstName, targetUserId, loggedInUserId, chatMessages }) => {

        const roomID = [targetUserId, loggedInUserId].sort().join("-");

        const sender = await UserModel.findById(loggedInUserId).select(
          "_id firstName lastName photoURL"
        );
        if(!sender) return;
        io.to(roomID).emit("receiveMessage", {
          sender,
          chatMessages,
        });

        console.log(`${firstName} sent: ${chatMessages}`);
      }
    );

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });

  });
};

module.exports = initializeSocket;