const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  skill: {
    type: String,
    required: true,
  },
  type: {
    type: String, // "learn" or "teach"
    required: true,
  },
});

// ⭐ Rating Schema
const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // person who gave rating
    ref: "User",
    required: true,
  },
  stars: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const messageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema({
  with: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messages: [messageSchema],
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  canTeach: {
    type: String,
    default: "",
  },

  wantToLearn: {
    type: String,
    default: "",
  },

  requests: [requestSchema],
  acceptedRequests: [requestSchema],

  chat: [chatSchema],

  // ⭐ NEW: ratings array
  ratings: [ratingSchema],
});

// ⭐ Compute average & total reviews
userSchema.methods.getRatingSummary = function () {
  const totalReviews = this.ratings.length;
  const avg =
    totalReviews === 0
      ? 0
      : this.ratings.reduce((sum, r) => sum + r.stars, 0) / totalReviews;

  return {
    averageRating: Number(avg.toFixed(1)),
    totalReviews,
  };
};

module.exports = mongoose.model("User", userSchema);
