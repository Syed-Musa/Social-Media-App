import dotenv from "dotenv";
import mongoose from "mongoose";

import Post from "../models/Post.js";
import User from "../models/User.js";

dotenv.config();

const run = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI in environment");
  }

  await mongoose.connect(mongoUri);

  const posts = await Post.find();
  let updatedPosts = 0;
  let updatedComments = 0;

  for (const post of posts) {
    let postChanged = false;

    if (!post.username) {
      const user = await User.findById(post.user).select("username");
      if (user?.username) {
        post.username = user.username;
        postChanged = true;
        updatedPosts += 1;
      }
    }

    for (const comment of post.comments) {
      if (!comment.username) {
        const user = await User.findById(comment.user).select("username");
        if (user?.username) {
          comment.username = user.username;
          postChanged = true;
          updatedComments += 1;
        }
      }
    }

    if (postChanged) {
      await post.save();
    }
  }

  console.log(`Backfill complete: ${updatedPosts} posts, ${updatedComments} comments updated.`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Backfill failed", error);
  process.exit(1);
});
