import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
},{
    timestamps: true
})

export const chatModel = mongoose.model('chat', chatSchema);