const mongoose = require("mongoose");
const express = require("express");
const { UserAuth } = require("../middleware/auth");
const ConnectionRequestModel = require("../models/connection");
const requestRouter = express.Router();
const UserModel = require("../models/user");

// request send api
requestRouter.post(
  "/request/send/:status/:toUserId",
  UserAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      if (!mongoose.Types.ObjectId.isValid(toUserId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid User ID",
        });
      }
      // validation for status
      const isAllowed = ["interested", "ignore"];
      if (!isAllowed.includes(status)) {
        return res.status(400).json({ error: "invalid status" });
      }
      // check if the request already exists
      const existingRequest = await ConnectionRequestModel.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingRequest) {
        return res.status(400).json({ error: "request already exists" });
      }

      // user is not sending request to himself
      if (fromUserId.equals(toUserId)) {
        return res
          .status(400)
          .json({ error: "you cannot send request to yourself" });
      }
      // checking if the toUserId is present in database or not
      const toUser = await UserModel.findById(toUserId);
      if (!toUser) {
        return res.status(400).json({ error: "user not found" });
      }
      const connectionRequest = new ConnectionRequestModel({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();
      res.json({ message: "request sent successfully", data });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  },
);

// request respond api
requestRouter.post(
  "/request/review/:status/:requestId",
  UserAuth,
  async (req, res) => {
    try {
      // mahesh => kittu
      // kittu accept kregi
      // logged in user => kittu( toUserId)
      // status = interested tabhi ye hoga
      // kittu request me agar accept ya reject hi kregi
      // kiitu ko jo request aaya vo requestId(ye requestId user ki nhi h connection request) valid honi chahiye

      const loggedInUser = req.user;
      const { status, requestId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Request ID",
        });
      }
      // validation for status just accept or reject

      const isAllowed = ["accepted", "rejected"];
      if (!isAllowed.includes(status)) {
        return res.status(400).json({ error: "invalid status" });
      }
      // checking if the requestId is valid or not

      const request = await ConnectionRequestModel.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!request) {
        return res.status(404).json({ error: "request not found" });
      }

      request.status = status;
      await request.save();

      res.json({
        message: `Request ${status} successfully`,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  },
);

module.exports = requestRouter;
