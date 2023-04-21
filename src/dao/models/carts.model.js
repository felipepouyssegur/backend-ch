import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    products: [
        {
            _id: false,
            name: {
                type: String,
            },
            id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Products'
            },
            quantity: {
                type: Number,
                default: 1,
            },
        },
    ],
});

cartSchema.pre('find', function (next) {
    this.populate('products.id');
    next();
});

export const cartsModel = mongoose.model('Carts', cartSchema);

