import mongoose, {Document } from "mongoose";

export interface IUser extends Document {
  fullName: {
    firstName: string;
    lastName: string;
  };
  email: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>({
    fullName:{
        firstName:{
            type: String,
            required: true
        },
        lastName:{
            type: String,
            required: true
        }
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String
    }
},{
    timestamps: true
})

export const userModel = mongoose.model<IUser>('user', userSchema);