import express from "express";

import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

//create a book
router.post("/", protectRoute, async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: "The request body is missing or empty.",
      });
    }

    const { title, caption, rating, image } = req.body;
    if (!title || !caption || !rating || !image) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    //upload the image to cloudinary
    // save to database
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageUrl,
      user: req.user_id, // protected req
    });

    await newBook.save();

    res.status(201).json(newBook);
  } catch (error) {
    console.log("Error creating a book", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

//get all books
//delete a book

export default router;
