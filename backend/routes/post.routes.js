import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createPost,
  deletePost,
  likeUnlikePost,
  commentOnPost,
  getAllPosts,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
  getCollegePosts,
  getCoursePosts
} from "../controllers/post.controller.js";

const router = express.Router();


router.get("/all", protectRoute, getAllPosts);
router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/:id", protectRoute, deletePost);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.get("/college/:collegeName", protectRoute, getCollegePosts);
router.get("/course/:course", protectRoute, getCoursePosts);

export default router;
