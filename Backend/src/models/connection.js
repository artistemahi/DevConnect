const mongoose = require("mongoose");

const ConnectionSchema = new mongoose.Schema(
  {
    fromUserId: {
      ref: "user", // reference to the user collection
      type: mongoose.Schema.Types.ObjectId,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // reference to the user collection
    },
    status: {
      type: String,
      enum: {
        values: ["ignore", "interested", "accepted", "rejected"],
        message: `{VALUE} is not supported`,
      },
    },
  },
  { timestamps: true },
);
ConnectionSchema.index(
{ fromUserId: 1, toUserId: 1 },
{ unique: true }
);
ConnectionSchema.pre("save", async function () {
  const connection = this;
  if (connection.toUserId.equals(connection.fromUserId)) {
    throw new Error("you cannot send request to yourself");
  }
});

const ConnectionModel = mongoose.model("Connection", ConnectionSchema);
module.exports = ConnectionModel;
