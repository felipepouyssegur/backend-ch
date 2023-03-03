import { chatModel } from "../models/chat.model.js";

export default class ChatManager {
    async addMessage(user, message) {
        try {
            const newMessage = await chatModel.create({ user, message });
            return newMessage;
        } catch (error) {
            return error;
        }
    }

    async getAllMessages() {
        try {
            const messages = await chatModel.find();
            return messages;
        } catch (error) {
            return error;
        }
    }
}