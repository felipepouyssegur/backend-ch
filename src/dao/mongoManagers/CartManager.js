import { cartsModel } from '../models/carts.model.js';


export default class CartManager {

    async createCart() {
        const cart = new cartsModel({ cid: Math.floor(Math.random() * 100000), products: [] });
        await cart.save();
        return cart.cid;
    }

    async getCart(id) {
        const cart = await cartsModel.findOne({ cid: id });
        if (cart) {
            return cart.toObject();
        } else {
            return false;
        }
    }

    async addProduct(idCart, idProduct) {
        const cart = await cartsModel.findOne({ cid: idCart });
        if (!cart) {
            return false;
        }
        let productIndex = cart.products.findIndex((product) => product.id === idProduct);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ id: idProduct, quantity: 1 });
        }
        await cart.save();
        return cart.toObject();
    }


}