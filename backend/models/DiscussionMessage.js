const mongoose = require("mongoose");

const DiscussionMessageSchema = new mongoose.Schema({
  user: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("DiscussionMessage", DiscussionMessageSchema);
