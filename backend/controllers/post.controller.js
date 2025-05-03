import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";

// Create Post
export const createPost = async (req, res) => {
  try {
    const { text, img } = req.body;
    const userId = req.user._id;

    if (!text && !img) {
      return res.status(400).json({ error: "Post must have text or image." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    let imageUrl = null;
    if (img) {
      const uploaded = await cloudinary.uploader.upload(img);
      imageUrl = uploaded.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img: imageUrl,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("createPost error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Delete Post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found." });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized to delete this post." });
    }

    if (post.img) {
      const publicId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully." });
  } catch (err) {
    console.error("deletePost error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Comment on Post
export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;

    if (!text) return res.status(400).json({ error: "Text is required." });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found." });

    post.comments.push({ user: req.user._id, text });
    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("user", "-password")
      .populate("comments.user", "-password");

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("commentOnPost error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Like/Unlike Post
export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;

    let post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found." });

    const liked = post.likes.includes(userId);

    if (liked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
    } else {
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $addToSet: { likedPosts: postId } });

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("user", "-password")
      .populate("comments.user", "-password");

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("likeUnlikePost error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Get All Posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 })
      .populate("user", "-password")
      .populate("comments.user", "-password");

    res.status(200).json(posts);
  } catch (err) {
    console.error("getAllPosts error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Get Liked Posts
export const getLikedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate("user", "-password")
      .populate("comments.user", "-password");

    res.status(200).json(likedPosts);
  } catch (err) {
    console.error("getLikedPosts error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Get Following Users' Posts
export const getFollowingPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found." });

    const posts = await Post.find({ user: { $in: user.following || [] } })
      .sort({ createdAt: -1 })
      .populate("user", "-password")
      .populate("comments.user", "-password");

    res.status(200).json(posts);
  } catch (err) {
    console.error("getFollowingPosts error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Get Posts by Username
export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found." });

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("user", "-password")
      .populate("comments.user", "-password");

    res.status(200).json(posts);
  } catch (err) {
    console.error("getUserPosts error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
export const getCollegePosts = async (req, res) => {
    const { collegeName } = req.params;
    try {
      const users = await User.find({ collegeName }).select("_id");
      const userIds = users.map(user => user._id);
  
      const posts = await Post.find({ postedBy: { $in: userIds } })
        .populate("postedBy", "-password")
        .sort({ createdAt: -1 });
  
      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch college posts" });
    }
  };
  export const getCoursePosts = async (req, res) => {
    const { course } = req.params;
    try {
      const users = await User.find({ course }).select("_id");
      const userIds = users.map(user => user._id);
  
      const posts = await Post.find({ postedBy: { $in: userIds } })
        .populate("postedBy", "-password")
        .sort({ createdAt: -1 });
  
      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch course posts" });
    }
  };
  