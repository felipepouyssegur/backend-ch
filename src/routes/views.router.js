import ProductManager from '../dao/mongoManagers/ProductManager.js'
import { Router } from 'express'
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

/* CHAT */



export default router