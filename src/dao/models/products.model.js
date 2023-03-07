import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    }

})


productSchema.plugin(mongoosePaginate)

export const productsModel = mongoose.model('Products', productSchema)
