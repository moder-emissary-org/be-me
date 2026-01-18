import mongoose, { Schema } from "mongoose";

const SocietySchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
  },
  { timestamps: true }
);

export const Society = mongoose.model("Society", SocietySchema);

/* Additional fields that can be added to the Society model:{
  city: { 
  type: String, 
  required: true
},
  state: { 
  type: String, 
  required: true
},
  zipCode: { 
  type: String, 
  required: true
},
  country: { 
  type: String, 
  required: true
},
  contactNumber: { 
  type: String, 
  required: true
},
  email: { 
  type: String, 
  required: true, 
  unique: true
},
  registrationNumber: { 
  type: String, 
  required: true, 
  unique: true
},
  managerId: { 
  type: mongoose.
  Types.ObjectId, 
  ref: "User"
   },
}
*/