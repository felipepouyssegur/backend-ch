import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    products: [
        {
            _id: false,
            id: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                default: 1,
            },
        },
    ],
});


export const cartsModel = mongoose.model('Carts', cartSchema)

