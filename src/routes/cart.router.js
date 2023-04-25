import { Router } from "express";
import { cartsModel } from "../dao/models/carts.model.js";
import { productsModel } from "../dao/models/products.model.js";
import TicketManager from "../dao/mongoManagers/TicketManager.js";
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

/* Finalizo Compra */
const tm = new TicketManager()

router.post('/:cid/purchase', async (req, res) => {
    console.log(req.user)
    try {
        const cart = await cartsModel.findById(req.params.cid);
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        // Verificar si hay suficiente stock para cada producto en el carrito
        const unavailableProducts = [];
        for (let i = 0; i < cart.products.length; i++) {
            const product = cart.products[i];
            const dbProduct = await productsModel.findById(product.id);
            if (!dbProduct) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
            if (dbProduct.stock < product.quantity) {
                // Agregar el producto al array de productos no disponibles
                unavailableProducts.push({ id: product.id, name: dbProduct.name });
                // Actualizar la cantidad de productos en el carrito igual a la cantidad de stock disponible
                product.quantity = dbProduct.stock;
                dbProduct.stock = 0;
                await dbProduct.save();
            } else {
                // Restar el stock del producto y continuar con la compra
                dbProduct.stock -= product.quantity;
                await dbProduct.save();
            }
        }

        // Filtrar los productos del carrito para eliminar aquellos con una cantidad igual a cero
        cart.products = cart.products.filter(product => product.quantity > 0);
        await cart.save();

        if (unavailableProducts.length > 0) {
            return res.status(400).json({ message: 'No hay suficiente stock para algunos productos en el carrito', unavailableProducts });
        }

        // Calcular el monto total de la compra
        let totalAmount = 0;
        for (let i = 0; i < cart.products.length; i++) {
            const product = cart.products[i];
            const dbProduct = await productsModel.findById(product.id);
            totalAmount += dbProduct.price * product.quantity;
        }

        // Crear un ticket con los datos de la compra

        const ticket = await tm.createTicket(cart, totalAmount);

        return res.status(200).json({ message: 'Compra realizada exitosamente', ticket });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al procesar la compra' });
    }
});


export default router;