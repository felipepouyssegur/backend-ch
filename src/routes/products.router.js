import { Router } from "express";
import { ProductManager } from '../clases/ProductManager.js';

const router = Router()


const pm = new ProductManager('./src/storage/products.json');



/* getProducts para mostrar todos mis productos */
router.get('/', async (req, res) => {
    const { limit } = req.query
    const products = await pm.getProducts(parseInt())
    const productosObtenidos = products.slice(0, limit)
    res.json({ message: 'Estos son los productos obtenidos:', productosObtenidos })
})


/* getProductsById, verifico que exista id*/
router.get('/:idProducts', async (req, res) => {
    const { idProducts } = req.params
    const id = parseInt(idProducts)
    const product = await pm.getProductById(id)
    if (product) {
        res.json({ message: `Producto con id ${id} encontrado`, product })
    } else {
        res.json('No se encontro ningun producto')
    }
})


/* Add product */
router.post('/', async (req, res) => {
    try {
        const { title, description, price, code, status, stock, category, thumbnails } = req.body;
        const newProduct = await pm.addProduct({ title, description, price, code, status, stock, category, thumbnails });
        res.json({ newProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el producto', error });
    }
});

/* Modify product */
router.put('/:idProducts', (req, res) => {
    const { idProducts } = req.params;
    const newValor = req.body;
    const field = Object.keys(newValor).toString();
    const value = Object.values(newValor).toString();
    const prodEdit = pm.updateProduct(parseInt(idProducts), field, value);

    res.json({ message: "Producto editado correctamente", prodEdit });
})


router.delete("/:idProducts", (req, res) => {
    const { idProducts } = req.params;
    const del = pm.deleteProduct(parseInt(idProducts));
    res.json({ message: `Producto con ID ${idProducts} eliminado correctamente.` });
});

export default router

