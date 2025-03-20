import mongoose from "mongoose";
const notificationSchema=new mongoose.Schema({
    from:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        requires:true
    },
    to:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        requires:true  
    },
    type:{
      type:String,
      requires:true,
      enum:['follow','like']
    },
    read:{
        type:Boolean,
        default:false
    }
},{timestamps: true});
const Notifications=mongoose.model('Notification',notificationSchema);
export default Notifications;