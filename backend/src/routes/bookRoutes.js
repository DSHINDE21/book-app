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

    // Convert rating to number if it's a string
    const ratingNumber =
      typeof rating === "string" ? parseInt(rating, 10) : Number(rating);

    if (isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be a number between 1 and 5" });
    }

    //upload the image to cloudinary
    // save to database
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    const newBook = new Book({
      title,
      caption,
      rating: ratingNumber,
      image: imageUrl,
      user: req.user_id, // protected req
    });

    await newBook.save();

    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

//get all books
//pagination -> infinite scrolling
// fetch("http://localhost:3000/api/books?page=3&limit=5")
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 }) // desc order
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments();

    res.send({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit), // fields for FE
    });
    // default status code is 200
  } catch (error) {
    console.log("Error in get books", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//get recommended books by the logged in user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(books);
  } catch (error) {
    console.log("Get user books error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

//delete a book
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // checking if user is the creator of a book
    if (book.user.toString() !== req.user_id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // delete image from cloudinary
    // sample url: https://res.cloudinary.com/image/upload/v188383849/qhuruuejhe.png ...
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log("Error deleting image on cloudinary", error);
      }
    }

    await book.deleteOne();

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.log("Error deleting a book", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
