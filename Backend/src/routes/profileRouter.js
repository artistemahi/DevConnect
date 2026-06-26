const express = require("express");
const profileRouter = express.Router();
const UserModel = require("../models/user");
const { UserAuth } = require("../middleware/auth");
const { validateProfileEdit } = require("../utils/ValidationFn");
const bcrypt = require("bcryptjs");
const Validator = require("validator");

// profile/view
profileRouter.get("/profile/view", UserAuth, async (req, res) => {
  try {
    const { user } = req;
    if (!user) {
      return res.status(401).json({ error: "please login again" });
    }
    res.json({ user });
  } catch (err) {
    rres.status(400).json({
  success:false,
  message:err.message
})
  }
});
// profile/edit
profileRouter.post("/profile/edit", UserAuth, async (req, res) => {
  try {
    validateProfileEdit(req);

    const loggedInUser = req.user;
    Object.keys(req.body).forEach((field) => {
      loggedInUser[field] = req.body[field];
    });

    await loggedInUser.save();
    res.json({
      message: `profile updated successfully for user : ${loggedInUser.firstName}`,
      user: loggedInUser,
    });
  } catch (err) {
    res.status(400).json({
  success:false,
  message:err.message
})
  }
});

// profile/password-change
profileRouter.post("/profile/password-change", UserAuth, async (req, res) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;
    const hashedPassword = user.password;
    const isMatch = await bcrypt.compare(oldPassword, hashedPassword);
    if (!isMatch) {
      throw new Error("old password is incorrect");
    }
    if (!Validator.isStrongPassword(newPassword)) {
      throw new Error("New password is not strong enough");
    }
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await user.save();
    res.json({ message: "password changed successfully" });
  } catch (err) {
   res.status(400).json({
  success:false,
  message:err.message
})
  }
});

module.exports = { profileRouter };
