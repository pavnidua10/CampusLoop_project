import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie=(userId,res)=>{
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    const token=jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"15d",
    }
    )
    res.cookie("jwt",token,{
        maxAge:15*24*60*60*1000,
        httpOnly:true,
        // sameSite:"strict",
        // secure:process.env.NODE_ENV!=="development",
        secure: true,
        sameSite: "none",

    })
    console.log("Generated token:", token);
}