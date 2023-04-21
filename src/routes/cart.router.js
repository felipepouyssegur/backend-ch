import { Router } from "express";
import { cartsModel } from "../dao/models/carts.model.js";
import { productsModel } from "../dao/models/products.model.js";

import CartManager from "../dao/mongoManagers/CartManager.js"

const router = Router();
const cm = new CartManager();


/* Crea nuevo cart con ID autogenerada, array vacio. */

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

/* Muestra productos dentro del Cart con ID especifica. */

router.get('/:cartId', async (req, res) => {
    const { cartId } = req.params
    const cart = await cm.getCartById(cartId)
    res.json({ cart })
})

/* Agrego un producto al carrito deseado */

router.post("/:idCart/products/:idProduct", async (req, res) => {
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
        const itemIndex = cart.products.findIndex((item) => item.id.equals(idProduct));

        if (itemIndex > -1) {
            cart.products[itemIndex].quantity += 1;
        } else {
            cart.products.push({ name: product.name, id: product._id, quantity: 1 });
        }

        // Save the updated cart in the database
        const updatedCart = await cart.save();

        res.json(updatedCart);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Eliminar un producto especifico del carrito
router.delete('/:idCart/products/:idProduct', async (req, res) => {
    try {
        const { idCart, idProduct } = req.params;

        const cart = await cartsModel.findById(idCart);
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado, por favor ingresar un ID valido." });
        }

        const productIndex = cart.products.findIndex(p => p._id == idProduct);
        if (productIndex === -1) {
            return res.status(404).json({ message: "Producto no encontrado en el carrito" });
        }

        cart.products.splice(productIndex, 1);
        await cart.save();

        res.json({ message: "Producto eliminado del carrito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});





/* Elimino el producto seleccionado */

router.delete('/:idCart/products/:idProduct', async (req, res) => {
    try {
        const { idCart, idProduct } = req.params;

        const cart = await cartsModel.findById(idCart);
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado, por favor ingresar un ID valido." });
        }

        const product = await productsModel.findById(idProduct);
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado, por favor ingresar un ID valido." });
        }

        const productIndex = cart.products.findIndex((p) => p.id === idProduct);

        if (productIndex === -1) {
            return res.status(404).json({ message: "Producto no encontrado en el carrito" });
        }

        if (cart.products[productIndex].quantity === 1) {
            cart.products.splice(productIndex, 1);
        } else {
            cart.products[productIndex].quantity--;
        }

        await cart.save();

        res.json({ message: "Producto eliminado del carrito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

/* Actualizo productos con un nuevo array */

router.put('/:idCart', async (req, res) => {
    try {
        const cart = await cartsModel.findByIdAndUpdate(
            req.params.idCart,
            { products: req.body },
            { new: true }
        )
        res.send(cart)
    } catch (error) {
        console.error(error)
        res.status(500).send('Error updating cart')
    }
})

/* Actualizar quantity de producto especifico */

router.put('/:idCart/products/:idProduct', async (req, res) => {
    try {
        const { idCart, idProduct } = req.params;

        const cart = await cartsModel.findById(idCart);
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado, por favor ingresar un ID valido." });
        }

        const product = cart.products.find(p => p.id === idProduct);
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado, por favor ingresar un ID valido." });
        }

        const { quantity } = req.body;
        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: "Cantidad invalida" });
        }

        product.quantity = quantity;
        await cart.save();

        res.json({ message: "Cantidad de producto incrementada" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/* Elimino todos los productos del cart */

router.delete('/:idCart', async (req, res) => {
    try {
        const { idCart } = req.params;

        const cart = await cartsModel.findById(idCart);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.products = []; // Elimina todos los productos del carrito
        await cart.save();

        res.json({ message: "Productos del carrito eliminados exitosamente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});



export default router;