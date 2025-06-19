const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const FLASK_API_URL = process.env.FLASK_API_URL || "http://localhost:5000";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://tyre-detection-model.vercel.app";
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/tyredetect";
const JWT_SECRET = process.env.JWT_SECRET || "tyredetect-secret-key";
const EMAIL_SENDER = process.env.EMAIL_SENDER || "hrushireddy@gmail.com";
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || "gmail";

// Debug environment variables
console.log("Environment check:");
console.log("FLASK_API_URL:", FLASK_API_URL);
console.log("FRONTEND_URL:", FRONTEND_URL);
console.log(
  "MongoDB URI:",
  MONGODB_URI.replace(/mongodb:\/\/.*@/, "mongodb://[hidden]@")
);
console.log("Node environment:", process.env.NODE_ENV);

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Analysis History Schema (Updated with details)
const analysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  image: { type: Buffer, required: true },
  prediction: { type: String, required: true },
  probability: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  details: {
    wear: { score: Number, status: String },
    cuts: { score: Number, status: String },
    tread: { score: Number, status: String },
    bulge: { score: Number, status: String },
    aging: { score: Number, status: String },
    depth: { score: Number, status: String },
  },
});

const Analysis = mongoose.model("Analysis", analysisSchema);

// Configure CORS
const allowedOrigins = [
  "https://tyre-detection-model.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Multer configuration (Memory Storage)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    console.log("Authorization header:", authHeader);

    if (!authHeader || authHeader === "Bearer null") {
      console.log("Missing or invalid Authorization header");
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Extracted token:", token);

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log("User not found for ID:", decoded.userId);
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.log("Authentication error:", error.message);
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expired, please log in again" });
    }
    res.status(401).json({ error: "Invalid token" });
  }
};

// API Routes
app.get("/", (req, res) => {
  res.json({
    message: "Tyre Detection API Server",
    status: "Running",
    endpoints: {
      health: "/health",
      signup: "/api/signup",
      login: "/api/login",
      profile: "/api/profile",
      predict: "/predict",
      history: "/api/history",
      analytics: "/api/analytics",
      stats: "/stats"
    },
    frontend: "https://tyre-detection-model.vercel.app"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.get("/test-flask-connection", async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_API_URL}/health`);
    res.json({
      status: "Connection successful",
      flaskResponse: response.data,
    });
  } catch (error) {
    console.error("Flask connection test failed:", error);
    res.status(500).json({
      error: "Failed to connect to Flask API",
      details: error.message,
    });
  }
});

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already in use" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ error: "Please provide an email address" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: "OTP sent if email exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
      service: EMAIL_SERVICE,
      auth: { user: EMAIL_SENDER, pass: EMAIL_PASSWORD },
    });

    const mailOptions = {
      from: EMAIL_SENDER,
      to: user.email,
      subject: "Password Reset OTP",
      html: `
        <h1>Password Reset OTP</h1>
        <p>You requested a password reset.</p>
        <h2 style="font-size: 24px; background-color: #f0f0f0; padding: 10px; text-align: center;">${otp}</h2>
        <p>This OTP expires in 1 hour.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP sent to your email address" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ error: "Server error during password reset request" });
  }
});

app.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired OTP" });

    const tempToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "15m",
    });
    res.json({ success: true, tempToken });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ error: "Server error during OTP verification" });
  }
});

app.post("/api/reset-password", async (req, res) => {
  try {
    const { tempToken, newPassword } = req.body;
    const decoded = jwt.verify(tempToken, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(400).json({ error: "User not found" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error during password reset" });
  }
});

app.get("/api/profile", authenticate, async (req, res) => {
  res.json({
    user: { id: req.user._id, name: req.user.name, email: req.user.email },
  });
});

app.get("/stats", authenticate, async (req, res) => {
  try {
    const totalChecked = await Analysis.countDocuments({
      userId: req.user._id,
    });
    const goodTyres = await Analysis.countDocuments({
      userId: req.user._id,
      prediction: "Good",
    });
    const badTyres = totalChecked - goodTyres;

    res.json({
      totalChecked,
      totalScanned: totalChecked,
      goodTyres,
      badTyres,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Server error fetching stats" });
  }
});

// Updated /predict Endpoint
app.post("/predict", authenticate, upload.single("image"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No image file provided" });

    console.log("Processing image prediction request");
    console.log("Image size:", req.file.size);
    console.log("Image type:", req.file.mimetype);
    console.log("Image filename:", req.file.originalname);

    const formData = new FormData();
    formData.append("image", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    console.log("Sending request to Flask API...");
    const flaskResponse = await axios.post(
      `${FLASK_API_URL}/predict`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      }
    );

    console.log("Flask API response received:", flaskResponse.data);

    const predictionIsGood = flaskResponse.data.prediction === "Good";
    const probability = flaskResponse.data.probability;

    // Compute detailed results
    const analysisDetails = {
      wear: {
        score: predictionIsGood ? 85 : 40,
        status: predictionIsGood ? "Good" : "Poor",
      },
      cuts: {
        score: predictionIsGood ? 92 : 45,
        status: predictionIsGood ? "Good" : "Poor",
      },
      tread: {
        score: predictionIsGood ? 78 : 35,
        status: predictionIsGood ? "Fair" : "Poor",
      },
      bulge: {
        score: predictionIsGood ? 95 : 30,
        status: predictionIsGood ? "Good" : "Poor",
      },
      aging: {
        score: predictionIsGood ? 83 : 40,
        status: predictionIsGood ? "Good" : "Poor",
      },
      depth: {
        score: predictionIsGood ? 76 : 35,
        status: predictionIsGood ? "Fair" : "Poor",
      },
    };

    const analysis = new Analysis({
      userId: req.user._id,
      image: req.file.buffer,
      prediction: flaskResponse.data.prediction,
      probability,
      details: analysisDetails,
    });

    await analysis.save();
    console.log("Analysis saved to database");

    res.json({
      prediction: flaskResponse.data.prediction,
      probability,
      details: analysisDetails,
    });
  } catch (error) {
    console.error("Prediction error:", error.message);
    if (error.response) {
      console.error("Flask API error response:", error.response.data);
      res.status(error.response.status).json({
        error: "Error from prediction service",
        details: error.response.data,
      });
    } else if (error.request) {
      console.error("No response received from Flask API");
      res.status(503).json({ error: "Prediction service unavailable" });
    } else {
      console.error("Error setting up request:", error.stack);
      res
        .status(500)
        .json({ error: error.message || "Failed to process image" });
    }
  }
});

// Updated /api/history Endpoint
app.get("/api/history", authenticate, async (req, res) => {
  try {
    const history = await Analysis.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(50);

    const historyWithImages = history.map((entry) => ({
      id: entry._id,
      date: entry.date.toISOString().split("T")[0],
      status: entry.prediction === "Good" ? "PASS" : "FAIL",
      confidence: Math.round(entry.probability * 100),
      image: `data:image/jpeg;base64,${entry.image.toString("base64")}`,
      details: entry.details, // Include detailed breakdown
    }));

    const monthlyTrends = await Analysis.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          passes: { $sum: { $cond: [{ $eq: ["$prediction", "Good"] }, 1, 0] } },
          fails: { $sum: { $cond: [{ $ne: ["$prediction", "Good"] }, 1, 0] } },
        },
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $cond: [{ $lt: ["$_id.month", 10] }, "0", ""] },
              { $toString: "$_id.month" },
            ],
          },
          passes: 1,
          fails: 1,
        },
      },
      { $sort: { month: -1 } },
      { $limit: 6 },
    ]);

    const formattedMonthlyTrends = monthlyTrends.reverse();

    res.json({
      history: historyWithImages,
      monthlyTrends: formattedMonthlyTrends,
    });
  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({ error: "Server error fetching history" });
  }
});

// Analytics Endpoint
app.get("/api/analytics", authenticate, async (req, res) => {
  try {
    const monthlyTrends = await Analysis.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          pass: { $sum: { $cond: [{ $eq: ["$prediction", "Good"] }, 1, 0] } },
          fail: { $sum: { $cond: [{ $ne: ["$prediction", "Good"] }, 1, 0] } },
          avgConfidence: { $avg: { $multiply: ["$probability", 100] } },
        },
      },
      {
        $project: {
          date: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $cond: [{ $lt: ["$_id.month", 10] }, "0", ""] },
              { $toString: "$_id.month" },
            ],
          },
          pass: 1,
          fail: 1,
          avgConfidence: { $round: ["$avgConfidence", 0] },
        },
      },
      { $sort: { date: 1 } },
    ]);

    const categoryBreakdown = await Analysis.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: "$prediction",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          prediction: "$_id",
          count: 1,
        },
      },
    ]);

    const formattedBreakdown = {
      good:
        categoryBreakdown.find((item) => item.prediction === "Good")?.count ||
        0,
      poor:
        categoryBreakdown.find((item) => item.prediction === "Bad")?.count || 0,
    };

    console.log("Analytics data:", {
      monthlyTrends,
      categoryBreakdown: formattedBreakdown,
    });

    res.json({
      history: monthlyTrends,
      categoryBreakdown: formattedBreakdown,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Server error fetching analytics" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message || "Something went wrong",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Start the server (only if not in Vercel environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
    console.log(`Connected to Flask API at ${FLASK_API_URL}`);
    console.log(`Serving frontend at ${FRONTEND_URL}`);
  });
}

// Export the Express API for Vercel
module.exports = app;
