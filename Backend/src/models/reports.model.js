import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prescription",
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  testName: { type: String, required: true },       
  result: { type: String },                         
  normalRange: { type: String },                    
  reportFileUrl: { type: String },                  
  notes: { type: String },                          
  createdAt: { type: Date, default: Date.now }
});

export default Reports = mongoose.model("Reports",reportSchema);