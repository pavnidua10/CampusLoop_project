import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {createPost,deletePost,likeUnlikePost,commentOnPost,getAllPosts,getLikedPosts,getFollowingPosts,
    getUserPosts} from "../controllers/post.controller.js"
const router=express.Router();
router.get("/likes/:id",protectRoute,getLikedPosts); //to get all liked post of a user
router.get("/all",protectRoute,getAllPosts);
router.post("/create",protectRoute,createPost)
router.post("/like/:id",protectRoute,likeUnlikePost) //to like a post
router.post("/comment/:id",protectRoute,commentOnPost)
router.delete("/:id",protectRoute,deletePost)
router.get("/following",protectRoute,getFollowingPosts); //posts of people you are following
router.get("/user/:username",protectRoute,getUserPosts); //posts of a user
export default router;