const dotenv = require("dotenv");
dotenv.config();
const helmet = require("helmet")
const cors = require("cors");
const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const UserModel = require("./models/user");
// cors enabling for all requests
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(helmet())

const authRouter = require("./routes/authRouter");
const { profileRouter } = require("./routes/profileRouter");
const requestRouter = require("./routes/requestRouter");
const userRouter = require("./routes/userRouter");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});
connectDB()
  .then(() => {
    console.log("connected to database");

    app.listen(process.env.PORT, () => {
      console.log("server started at port 3000...");
    });
  })
  .catch((err) => {
    console.log("error connecting to database", err);
  });
