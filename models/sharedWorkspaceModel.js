const mongoose = require("mongoose");

const sharedWorkspaceSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name for your shared workspace"],
  },
  owner: mongoose.Types.ObjectId,
  members: {
    type: Array,
    required: [true, "Please provide members for your shared workspace"],
  },
  sharedAccounts: Array,
  isActive: {
    type: Boolean,
    default: true,
  },
});

const SharedWorkspace = mongoose.model(
  "SharedWorkspace",
  sharedWorkspaceSchema,
);

module.exports = SharedWorkspace;
