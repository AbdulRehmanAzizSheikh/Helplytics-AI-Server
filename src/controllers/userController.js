import User from "../models/User.js";
import Notification from "../models/Notification.js";

// Register
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const user = new User({ username, email, password, role: role || "Both" });
    await user.save();

    // Create welcome notification
    await Notification.create({
      userId: user._id,
      text: `Welcome to HelpHub AI, ${user.username}! Start by exploring help requests.`,
      type: "Insight",
    });

    res.status(201).json({ message: "User registered", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.password !== password) return res.status(401).json({ message: "Invalid password" });

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Onboarding — update skills, interests, location
export const onboardUser = async (req, res) => {
  try {
    const { skills, interests, location } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.skills = skills || [];
    user.interests = interests || [];
    user.location = location || "";
    user.onboarded = true;
    await user.save();

    res.status(200).json({ message: "Onboarding complete", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// AI Suggestion for onboarding
export const aiSuggestSkills = async (req, res) => {
  try {
    const { skills, interests } = req.body;
    const allSkills = [...(skills || []), ...(interests || [])].map((s) => s.toLowerCase());

    let canHelpWith = [];
    let mayNeedHelp = [];

    if (allSkills.some((s) => s.includes("react") || s.includes("html") || s.includes("css"))) {
      canHelpWith.push("Frontend Layouts", "Responsive Design", "Basic React Components");
      mayNeedHelp.push("Advanced State Management", "Backend Integration");
    }
    if (allSkills.some((s) => s.includes("figma") || s.includes("design") || s.includes("ui"))) {
      canHelpWith.push("UI Review", "Poster Design", "Figma Prototyping");
      mayNeedHelp.push("Design Systems", "Motion Design");
    }
    if (allSkills.some((s) => s.includes("node") || s.includes("express") || s.includes("mongo"))) {
      canHelpWith.push("REST APIs", "Database Schema Design");
      mayNeedHelp.push("DevOps", "Deployment");
    }
    if (allSkills.some((s) => s.includes("python") || s.includes("data"))) {
      canHelpWith.push("Data Analysis", "Python Scripts");
      mayNeedHelp.push("Machine Learning", "Data Visualization");
    }

    if (canHelpWith.length === 0) canHelpWith.push("General Problem Solving");
    if (mayNeedHelp.length === 0) mayNeedHelp.push("Explore new skills on the platform");

    res.status(200).json({ canHelpWith, mayNeedHelp });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { username, skills, interests, location } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, skills, interests, location },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Leaderboard — top helpers by contributions and trustScore
export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ contributions: { $gt: 0 } })
      .sort({ trustScore: -1, contributions: -1 })
      .limit(10)
      .select("username skills trustScore contributions badges");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all users (for messaging dropdown)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("username email _id");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
