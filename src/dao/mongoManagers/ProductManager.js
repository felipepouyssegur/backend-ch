import { productsModel } from "../models/products.model.js";

export default class ProductManager {
    async getAllProducts() {
        try {
            const productsDB = await productsModel.find()
            return productsDB
        } catch (error) {
            return error
        }
    }

    async addProduct(product) {
        try {
            const newProduct = await productsModel.create(product)
            return newProduct
        } catch (error) {
            return error
        }
    }

}
