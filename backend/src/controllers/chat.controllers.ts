import { chatModel } from "../models/chat.models";
import { messageModel } from "../models/message.model";
import { asyncHandler } from "../utils/asyncHandler";
import { chatEditSchema, chatInputSchema } from "../validations/chatSchema.validations";

export const createChat = asyncHandler(async(req, res)=>{
    const result = await chatInputSchema.safeParseAsync(req.body);

    if (!result.success) {
        res.status(400).json({
            errors: result.error.format(),
        });
        return;
    }

    const {title} = result.data;

    const userId = req.user?._id;

    const chat = await chatModel.create({
        title,
        user: userId
    })

    res.status(201).json({
        message: "Chat created successfully",
        chat:{
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity
        }
    })
})

export const getAllChats = asyncHandler(async(req, res)=>{
    const chats = await chatModel.find({
        user: req.user?._id
    });

    if (!chats.length) {
        res.status(404).json({
            success: false,
            message: "No chats available"
        });
        return; 
    }

    res.status(200).json({
        success: true,
        count: chats.length,
        chats
    });
})

export const getMessages = asyncHandler(async(req, res)=>{
    const {chatId} = req.params
    const messages = await messageModel.find({
        chat: chatId
    });
    res.status(200).json({
        success: true,
        messages,
        count: messages.length
    })
})

export const updateChat = asyncHandler(async (req, res) => {
    const result = await chatEditSchema.safeParseAsync(req.body);

    if (!result.success) {
        res.status(400).json({
            errors: result.error.format(),
        });
        return;
    }

    const { title } = result.data;
    const { chatId } = req.params;

    const chat = await chatModel.findByIdAndUpdate(
        chatId,
        { title },
        { returnDocument: "after", runValidators: true }
    )

    if (!chat) {
        res.status(404).json({
        message: "Chat not found",
        });
        return;
    }

    res.status(200).json({
        message: "Chat updated successfully",
        chat,
    });
});

export const deleteChat = asyncHandler(async(req,res)=>{
    const { chatId } = req.params;
    await chatModel.findByIdAndDelete(
        chatId
    );

    res.status(200).json({
        message: "Chat deleted successfully",
    });
})