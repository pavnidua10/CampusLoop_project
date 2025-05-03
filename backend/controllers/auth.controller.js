import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';
export const signup=async(req,res)=>{
    try{
       const{fullName,username,email,password,collegeName,course,batchYear,userRole,isAvailableForMentorship}=req.body;
       if (
        !fullName ||
        !username ||
        !email ||
        !password ||
        !collegeName ||
        !course ||
        !batchYear
      ) {
        return res.status(400).json({ error: "Please fill all required fields." });
      }
       const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if(!emailRegex.test(email)){
        return res.status(400).json({error:"invalid email format"});

       }
       const existingUsername=await User.findOne({username});
       if(existingUsername){
        return res.status(400).json({error:"username is already taken"});
       }
       const existingEmail=await User.findOne({email});
       if(existingEmail){
        return res.status(400).json({error:"email is already taken"});
       }
       if(password.length<6){
        return res.status(400).json({error:"password must contain at least 6 characters"});
       }
       const salt=await bcrypt.genSalt(10);
       const hashedPassword=await bcrypt.hash(password,salt);
       const newUser=new User({
         fullName,
         username,
         email,
         password:hashedPassword,
         collegeName,
         course,
         batchYear,
        userRole,
        isAvailableForMentorship
       })
       if(newUser){
        generateTokenAndSetCookie(newUser._id,res)
        await newUser.save()
        res.status(201).json({
            _id:newUser._id,
            fullName:newUser.fullName,
            username:newUser.username,
            email:newUser.email,
            connections:newUser.connections,
            subscribedTo:newUser.subscribedTo,
            profileImg:newUser.profileImg,
            coverImg:newUser.coverImg,
        })
       }else{
        res.status(400).json({error:"invalid user data"});
       }
    }catch(error){
        console.log("error in signup controller",error.message);
       res.status(500).json({message:"internal server error",error:error.message})
    }
};
export const login=async(req,res)=>{
    try{
      const{username,password}=req.body;
      const user=await User.findOne({username})
      const isPasswordCorrect=await bcrypt.compare(password,user?.password||"")

      if(!user|| !isPasswordCorrect){
        return res.status(400).json({error:"missing username or password"})
      }
      generateTokenAndSetCookie(user._id,res)
      res.status(200).json({
          _id:user._id,
          fullName:user.fullName,
          username:user.username,
          email:user.email,
          connections:user.connections,
          subscribedTo:user.subscribedTo,
          profileImg:user.profileImg,
          coverImg:user.coverImg,
      })
    }catch(error){
        console.log("error in login controller",error.message);
       res.status(500).json({message:"internal server error",error:error.message})
    }
};
export const logout=async(req,res)=>{
  try{
    res.cookie("jwt","",{maxAge:0})
    res.status(200).json({message:"Logged out successfully"})
  }catch(error){
    console.log("error in logout controller",error.message);
    res.status(500).json({error:"internal server error"});
  }
};


// export const getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId).select('-password');
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d"
//     });

//     res.status(200).json(user);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error("Error in getMe:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


