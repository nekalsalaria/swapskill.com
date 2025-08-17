const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS for local frontend
app.use(
  cors({
    origin: "http://localhost:5173", // local React frontend
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("✅ API is running on localhost!");
});

// MongoDB connection without deprecated options
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
