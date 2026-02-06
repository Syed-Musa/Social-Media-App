import express from "express";
import mongoose from "mongoose";

import Post from "../models/Post.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const formatPost = (post) => {
  const likeUsernames = post.likes
    .filter((user) => user && user.username)
    .map((user) => user.username);

  const commentUsernames = post.comments
    .filter((comment) => comment.user && comment.user.username)
    .map((comment) => comment.user.username);

  return {
    id: post._id,
    text: post.text,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt,
    username: post.username || post.user?.username || "Unknown",
    likes: likeUsernames,
    comments: post.comments.map((comment) => ({
      id: comment._id,
      text: comment.text,
      username: comment.username || comment.user?.username || "Unknown",
      createdAt: comment.createdAt
    }))
  };
};

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "username")
      .populate("likes", "username")
      .populate("comments.user", "username");

    return res.json(posts.map(formatPost));
  } catch (error) {
    return res.status(500).json({ message: "Failed to load feed" });
  }
});

router.get("/mine", requireAuth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("user", "username")
      .populate("likes", "username")
      .populate("comments.user", "username");

    return res.json(posts.map(formatPost));
  } catch (error) {
    return res.status(500).json({ message: "Failed to load personal feed" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { text = "", imageUrl = "" } = req.body;

    if (!text.trim() && !imageUrl.trim()) {
      return res.status(400).json({ message: "Text or image URL is required" });
    }

    const post = await Post.create({
      user: new mongoose.Types.ObjectId(req.user.id),
      username: req.user.username,
      text: text.trim(),
      imageUrl: imageUrl.trim()
    });

    const populated = await Post.findById(post._id)
      .populate("user", "username")
      .populate("likes", "username")
      .populate("comments.user", "username");

    return res.status(201).json(formatPost(populated));
  } catch (error) {
    return res.status(500).json({ message: "Failed to create post" });
  }
});

router.post("/:id/like", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const alreadyLiked = post.likes.some((id) => id.equals(userId));

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => !id.equals(userId));
    } else {
      post.likes.push(userId);
    }

    await post.save();

    const populated = await Post.findById(post._id)
      .populate("user", "username")
      .populate("likes", "username")
      .populate("comments.user", "username");

    return res.json(formatPost(populated));
  } catch (error) {
    return res.status(500).json({ message: "Failed to update like" });
  }
});

router.post("/:id/comments", requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: req.user.id,
      username: req.user.username,
      text: text.trim()
    });
    await post.save();

    const populated = await Post.findById(post._id)
      .populate("user", "username")
      .populate("likes", "username")
      .populate("comments.user", "username");

    return res.status(201).json(formatPost(populated));
  } catch (error) {
    return res.status(500).json({ message: "Failed to add comment" });
  }
});

export default router;