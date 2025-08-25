const express = require("express");
const router = express.Router();
const DiscussionMessage = require("../models/DiscussionMessage");

// Get all messages
router.get("/", async (req, res) => {
  try {
    const messages = await DiscussionMessage.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Post a new message
router.post("/", async (req, res) => {
  try {
    const { user, message } = req.body;
    const newMessage = new DiscussionMessage({ user, message });
    await newMessage.save();
    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;
