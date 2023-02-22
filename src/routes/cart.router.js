import { Router } from "express";
import { cartsModel } from "../dao/models/carts.model.js";
import { productsModel } from "../dao/models/products.model.js";

import CartManager from "../dao/mongoManagers/CartManager.js"

const router = Router();
const cm = new CartManager();

router.post("/", async (req, res) => {
    try {
        const cart = new cartsModel({ products: [] });
        const savedCart = await cart.save();
        res.status(200).json(savedCart._id);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating cart");
    }
});


router.get("/:idCart", async (req, res) => {
    const { idCart } = req.params;
    const id = idCart;
    const cart = await cm.getCart(id);
    if (cart) {
        const products = cart.products;
        res
            .status(200)
            .json({ mesage: `Productos del carrito ${cart._id}`, products });
    } else {
        res.status(404).json({ mesage: "cart not found" });
    }
});

router.post("/:idCart/product/:idProduct", async (req, res) => {
    try {
        const { idCart, idProduct } = req.params;

        // Check if the cart exists
        const cart = await cartsModel.findById(idCart);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Check if the product exists
        const product = await productsModel.findById(idProduct);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if the product is already in the cart
        const itemIndex = cart.products.findIndex(
            (item) => item.product === idProduct

        );

        if (itemIndex > -1) {
            cart.products[itemIndex].quantity += 1;
            console.log(itemIndex)
        } else {
            cart.products.push({ product: idProduct, quantity: 1 });
            console.log(itemIndex)
        }

        // Update the cart
        const updatedCart = await cartsModel.findByIdAndUpdate(idCart, cart, {
            new: true,
        });

        res.status(200).json(updatedCart);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error adding product to cart");
    }
});

export default router;