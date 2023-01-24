import express from 'express'
import { ProductManager } from './src/clases/ProductManager.js';

const pm = new ProductManager('./src/storage/products.json');

const app = express()

/* SIEMPRE TENGO QUE PONER ESTO CON EXPRESS (PARA QUE ENTIENDA CUALQUIER FORMATO) */

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.listen(8080, () => {
    console.log('-----------------------------------------------------------------------')
    console.info('      ✅ El servidor esta corriendo en: http://localhost:8080')
    console.warn('      🔊 Escuchando el puerto 8080')
    console.log('-----------------------------------------------------------------------')
})


/* Ruta madre */

app.get('/', (req, res) => {
    const message = `<h1 style='color:red;'>Bienvenidos a mi servidor de express :)</h1>`
    res.send(message)
})

/* getProducts para mostrar todos mis productos */

app.get('/products', async (req, res) => {
    const { limit } = req.query
    const products = await pm.getProducts(parseInt())
    const productosObtenidos = products.slice(0, limit)
    res.json({ message: 'Estos son los productos obtenidos:', productosObtenidos })
})


/* getProductsById, verifico que exista id*/

app.get('/products/:idProducts', async (req, res) => {
    const { idProducts } = req.params
    const id = parseInt(idProducts)
    const product = await pm.getProductById(id)
    if (product) {
        res.json({ message: `Producto con id ${id} encontrado`, product })
    } else {
        res.json('No se encontro ningun producto')
    }
})



