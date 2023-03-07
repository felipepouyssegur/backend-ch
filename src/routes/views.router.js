import ProductManager from '../dao/mongoManagers/ProductManager.js'
import { Router } from 'express'
import { cartsModel } from '../dao/models/carts.model.js';
import { productsModel } from '../dao/models/products.model.js';
import { socketServer } from '../server.js';


const router = new Router()
const pm = new ProductManager();


// Vista para ser utilizada con protocolo http, layout home,
router.get('/', async (req, res) => {
    const { limit } = req.query;
    const products = await pm.getAllProducts();

    // Convert ObjectId properties to strings
    const productsFormatted = products.map(product => {
        return {
            ...product.toObject(),
            _id: product._id.toString()
        };
    });

    const productosObtenidos = productsFormatted.slice(0, limit);

    res.render('home', { products: productosObtenidos, layout: "main" });
});

// Vista para ser utilizada con protocolo WebSocket, layout home
router.get('/realtimeproducts', async (req, res) => {
    const { limit } = req.query;
    const products = await pm.getAllProducts();

    // Convert ObjectId properties to strings
    const productsFormatted = products.map(product => {
        return {
            ...product.toObject(),
            _id: product._id.toString()
        };
    });

    const productosObtenidos = productsFormatted.slice(0, limit);

    res.render('realTimeProducts', { products: productosObtenidos, layout: "main" });
});

/* Products */

router.get('/products', async (req, res) => {
    const { limit } = req.query;
    const products = await pm.getAllProducts();

    // Convert ObjectId properties to strings
    const productsFormatted = products.map(product => {
        return {
            ...product.toObject(),
            _id: product._id.toString()
        };
    });

    const productosObtenidos = productsFormatted.slice(0, limit);

    res.render('products', { products: productosObtenidos, layout: "main" });
});


/* Cart */

router.get('/cart/:idCart', async (req, res) => {
    try {
        const { idCart } = req.params
        const cart = await cartsModel.findById(idCart);
        const productDetails = await Promise.all(cart.products.map(async (product) => {
            const productDetail = await productsModel.findById(product.id);
            return {
                ...productDetail.toObject(),
                quantity: product.quantity,
            };
        }));
        res.render('cart', { products: productDetails });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving cart');
    }
});
export default router