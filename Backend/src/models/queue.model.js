import mongoose,{Schema} from "mongoose"

const QueueSchema=new Schema(
    {
        Clinic:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Clinic",
        },
        Doctor:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Doctor",
        },
        Status:{
            type:String,
            enum:["In-Progress","Stopped"]
        },
        date:
        {
            type:Date,
            required:true,
        }
    }
)

export const Queue=mongoose.model("Queue",QueueSchema);
