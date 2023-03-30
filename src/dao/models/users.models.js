import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true

    },
    last_name: {
        type: String,
        required: true

    },
    age: {
        type: Number,
        required: true
    },
    role: {
        type: String,
        default: "user",
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Carts",
    },
});

export const userModel = mongoose.model("User", userSchema);
