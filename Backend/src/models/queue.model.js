import mongoose,{Schema} from "mongoose"

const QueueSchema=new Schema(
    {
        doctor:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Doctor",
        },
        status:{
            type:String,
            enum:["In-Progress","Stopped"],
            default:"In-Progress",
        },
        date:{
            type:Date,
            required:true
        }
    }
)

export const Queue=mongoose.model("Queue",QueueSchema);
