const mongoose = require("mongoose");
const validator = require("validator");

const workspaceInvitationSchema = new mongoose.Schema(
  {
    workspace: mongoose.Types.ObjectId,
    sender: mongoose.Types.ObjectId,
    receiverEmail: {
      type: String,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    role: {
      type: String,
      enum: ["admin", "editor", "manager", "member"],
      default: "member",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const WorkspaceInvitation = mongoose.model(
  "WorkspaceInvitation",
  workspaceInvitationSchema,
);

module.exports = WorkspaceInvitation;
