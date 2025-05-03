import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import Notification from "../models/notification.model.js";
import {v2 as cloudinary} from "cloudinary";
export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username })
      .populate('assignedMentor', 'fullName username collegeName course batchYear profileImg bio') // Populate assigned mentor's details
      .populate('assignedMentorChatId')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log('Error in getUserProfile: ', error.message);
    res.status(500).json({ error: error.message });
  }
};


export const followUnfollowUser=async(req,res)=>{
    try{
        if (!req.user){
            return res.status(401).json({error:"no user found in request"});
        }
        const {id}=req.params;
        const userToModify=await User.findById(id);
        const currentUser=await User.findById(req.user._id);
       if(id===req.user._id.toString()){
        return res.status(400).json({message:"You can't follow/unfollow yourself"})
       }
   if(!userToModify || !currentUser) return res.status(400).json({error:"user not found"});

       const isFollowing=currentUser.following.includes(id);
       if(isFollowing){
        await User.findByIdAndUpdate(id,{$pull:{followers:req.user._id}});
        await User.findByIdAndUpdate(req.user._id,{$pull:{following:id}});
        res.status(200).json({message:"user unfollowed successfully"});

       }
       else{
        await User.findByIdAndUpdate(id,{$push:{followers:req.user._id}});
        await User.findByIdAndUpdate(req.user._id,{$push:{following:id}})
        const newNotification=new Notification({
            type:"follow",
            from:req.user._id,
            to:userToModify._id,
        });
        await newNotification.save();
        res.status(200).json({message:"user followed successfully"});
       }
    }catch(error){
        console.log("error in followUnfollowUser: ",error.message);
        res.status(500).json({error:error.message});
    }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch the current user's subscriptions (i.e. users they follow)
    const currentUser = await User.findById(userId).select("subscribedTo");

    // Use an empty array if subscribedTo doesn't exist yet
    const subscribedTo = currentUser?.subscribedTo || [];

    // Get random users (excluding self)
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    // Filter out users already followed
    const filteredUsers = users.filter(
      (user) => !subscribedTo.includes(user._id.toString())
    );

    // Limit to 4
    const suggestedUsers = filteredUsers.slice(0, 4);

    // Remove password field before sending
    suggestedUsers.forEach((user) => {
      delete user.password;
    });

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("error in getSuggestedUsers: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateUser=async(req,res)=>{
    const{fullName,email,username,currentPassword,newPassword,bio,link}=req.body;
    let {profileImg,coverImg}=req.body;
    const userId=req.user._id;
    try{
      let user=await User.findById(userId);
      if(!user) return res.status(404).json({message:"User not found"});
      if((!newPassword && currentPassword) || (newPassword && !currentPassword)){
        return res.status(400).json({error:"please provide both current password and new password"})
      }
      if(currentPassword && newPassword){
        const isMatch=await bcrypt.compare(currentPassword,user.password);
        if(!isMatch) return res.status(400).json({error:"CURRENT PASSWORD IS INCORRECT"})
            if(newPassword.length<6){
                return res.status(400).json({error:"password must have at least 6 characters"})
            }
            const salt=await bcrypt.genSalt(10);
            user.password=await bcrypt.hash(newPassword,salt);
      }
      if(profileImg){
        if(user.profileImg){
            await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
        }
        const uploadResponse=await cloudinary.uploader.upload(profileImg)
        profileImg=uploadResponse.secure_url;
      }
      if(coverImg){
        if(user.coverImg){
            await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
        }
        const uploadResponse=await cloudinary.uploader.upload(coverImg)
        profileImg=uploadResponse.secure_url;
      }
      user.fullName=fullName || user.fullName;
      user.email=email || user.email;
      user.username=username || user.username;
      user.bio=bio || user.bio;
      user.link=link|| user.link;
      user.profileImg=profileImg || user.profileImg;
      user.coverImg=coverImg || user.coverImg;
      user=await user.save();
      user.password=null;
      return res.status(200).json(user);
    }catch(error){
      console.log("error in update user: ",error.message);
      res.status(500).json({error:error.message});
    }
}

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    res.status(500).json({ error: "Server error" });
  }
};



export const searchUsers = async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim() === "") {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    }).select("fullName username _id");

    res.json({ users });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


