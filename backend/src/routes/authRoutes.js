import express from "express";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

const router = express.Router();

const generateToken = (userId) => {
  // userId is a unique identifier for the user
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" }); //15 days
};

router.post("/register", async (req, res) => {
  console.log("dinesh", req.body);

  try {
    // Check if body exists
    if (!req.body) {
      return res.status(400).json({ message: "Request body is required" });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Username must be at least 3 characters long" });
    }

    //check if user already exists
    // const existingUser = await User.findOne({or: [{email}, {username}]});
    // if (existingUser) {
    //   return res.status(400).json({ message: "User already exists" });
    // }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    //get random profile image from DiceBear API
    const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    const user = new User({ email, username, password, profileImage });

    //save user to database
    await user.save();

    //generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id, //it is mongo id
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //generate JWT token
    const token = generateToken(user._id);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error" });
  }
});
export default router;
