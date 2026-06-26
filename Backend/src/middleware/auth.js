const dotenv = require("dotenv")
dotenv.config();
const UserModel = require("../models/user");
const jwt = require("jsonwebtoken");
// code to authenticate
const UserAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send("please login !" );
    }
    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);
    const { id } = decodedObj;
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error("user not found");
    }
    req.user = user; // attaching the user data to the request object
    next();
  } catch (err) {
    res.status(400).end("Error:" + err.message);
  }
};
module.exports = {
  UserAuth,
};
