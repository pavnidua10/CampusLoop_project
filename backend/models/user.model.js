import mongoose from 'mongoose';
const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique: true
     },
    collegeName:{
       type:String,
    },
    course:{
        type:String,
     },
     batchYear:{
        type:Number,
     },
     userRole:{
        type:String,
        enum:["Student","Senior","Alumni"],
        default:"Student"
     },
     isAvailableForMentorship:{
        type:Boolean,
        default:false,
     },
    fullName:{
        type:String,
        required:true,

    },
    password:{
        type:String,
        required:true,
        minLength:6,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    connections:[
     {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:[],
     }
    ],
    subscribedTo:[
        {
           type:mongoose.Schema.Types.ObjectId,
           ref:"User",
           default:[],
        }
       ],
       profileImg:{
        type:String,
        default:"",
       },
       coverImg:{
        type:String,
        default:"",
       },
       bio:{
        type:String,
        default:"",
       },
       link:{
        type:String,
        default:"",
       },
       likedPosts:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        default:[]
       }
    ],
    assignedMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedMentorChatId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'MentorshipChat' 
    },
      assignedMentees: [{
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         default: [],
       }],
   

},{timestamps:true}
);
const User=mongoose.model("User",userSchema);
export default User;
