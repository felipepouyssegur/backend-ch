import { ProductManager } from '../clases/ProductManager.js'
import { Router } from 'express'

const router = new Router()
const pm = new ProductManager('./src/storage/products.json')


// Vista para ser utilizada con protocolo http, layout home,
router.get('/', async (req, res) => {
    const { limit } = req.query
    const products = await pm.getProducts(parseInt())
    const productosObtenidos = products.slice(0, limit)

    res.render('home', { products, layout: "main" })
})

// Vista para ser utilizada con protocolo WebSocket, layount home
router.get('/realtimeproducts', async (req, res) => {
    const { limit } = req.query
    const products = await pm.getProducts(parseInt())
    const productosObtenidos = products.slice(0, limit)

    res.render('realTimeProducts', { products, layout: "main" })
})


export default router