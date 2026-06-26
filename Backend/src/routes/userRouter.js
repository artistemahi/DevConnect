const express = require("express");
const userRouter = express.Router();
const { UserAuth } = require("../middleware/auth");
const ConnectionRequestModel = require("../models/connection.js");
const UserModel = require("../models/user.js");

const USER_SAFE_FIELDS = "firstName lastName age gender photoURL skills about ";
// Get all the pending friend requests for the loggedIn user
userRouter.get("/user/requests/received", UserAuth, async (req, res) => {
  try {
    // finding all the pending request for the loggedIn user
    const loggedInUser = req.user;
    const ConnectionRequestData = await ConnectionRequestModel.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId",USER_SAFE_FIELDS);
    res.json({
      message: "Data fetched successfully",
      data: ConnectionRequestData,
    });
  } catch (err) {
   res.status(400).json({
  success:false,
  message:err.message
})
  }
});

// get all the connections(accepted) for the loggedIn user
userRouter.get("/user/connections", UserAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequestModel.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_FIELDS)
      .populate("toUserId", USER_SAFE_FIELDS);
    const data = connections.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      } else {
        return row.fromUserId;
      }
    });
    res.json({
      message: "Data fetched successfully",
      data: data,
    });
  } catch (err) {
   res.status(400).json({
  success:false,
  message:err.message
})
  }
});

// feed api
userRouter.get("/user/feed", UserAuth, async (req, res) => {
  // user can see all the usercard except
  // 1. himself
  // 2. his connections ( accepted, rejected)
  // 3. ignored people ( rejected by him)
  // 4. already sent request ( interested by him)
  try {
    const loggedInUser = req.user;
    // finding all the connections for the loggedIn user
    const connections = await ConnectionRequestModel.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId status");

    // pagination
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit; // setting max limit to 50
    const skip = (page - 1) * limit;

    // console.log(connections);
    const hideUserFromfeed = new Set();
    connections.forEach((connection) => {
      hideUserFromfeed.add(connection.fromUserId.toString());
      hideUserFromfeed.add(connection.toUserId.toString());
    });
    const user = await UserModel.find({
      $and: [
        // excluding himself
        { _id: { $ne: loggedInUser._id } },
        // excluding all the connections ( accepted, rejected)
        { _id: { $nin: Array.from(hideUserFromfeed) } },
      ],
    })
      .select(USER_SAFE_FIELDS)
      .skip(skip)
      .limit(limit);
    res.json({
      message: "Data fetched successfully",
      data: user,
    });
  } catch (err) {
    res.status(400).json({
  success:false,
  message:err.message
})
  }
});
module.exports = userRouter;
