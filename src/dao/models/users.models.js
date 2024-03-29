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
        enum: ["user", "premium", "admin"],
        default: "user",
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Carts",
    },
    documents: [
        {
            name: {
                type: String,
            },
            reference: {
                type: String,
            },
        },
    ],
    last_connection: {
        type: Date,
        default: null,
    }
});

export const userModel = mongoose.model("User", userSchema);
