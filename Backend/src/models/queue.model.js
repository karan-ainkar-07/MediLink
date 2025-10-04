import mongoose,{Schema} from "mongoose"

const QueueSchema=new Schema(
    {
        clinic:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Clinic",
        },
        doctor:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Doctor",
        },
        status:{
            type:String,
            enum:["In-Progress","Stopped"],
            default:"In-Progress",
        },
        date:
        {
            type:Date,
            required:true,
        },
        totalTokens:
        {
            type:Number,
            required:true,
            default:0,
        },
        currentToken:
        {
            type:Number,
            default:0,
        },
        timeTaken:
        {
            type:[Number],
            required:true,
            default:[],
        }
    }
)

export const Queue=mongoose.model("Queue",QueueSchema);
