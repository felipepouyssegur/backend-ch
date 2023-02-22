import { Router } from "express";
import { productsModel } from "../dao/models/products.model.js";
/* import { ProductManager } from '../dao/fileManagers/ProductManager.js'; */
import ProductManager from '../dao/mongoManagers/ProductManager.js'



const router = Router()


const pm = new ProductManager();



/* getProducts para mostrar todos mis productos */
router.get('/', async (req, res) => {
    const products = await pm.getAllProducts()
    if (products.lenght < 0) {
        res.json({ message: 'No hay productos disponibles.' })
    } else {
        res.json({ message: 'Estos son tus productos', products })
    }
})


/* getProductsById, verifico que exista id*/
router.get('/:idProducts', async (req, res) => {
    const { idProducts } = req.params
    const id = idProducts
    const product = await productsModel.findById(id)
        .then(product => {
            return res.json({ message: `Producto con id ${id} encontrado`, product })
        })
        .catch(err => {
            return res.json(`Producto con ID: ${id} no encontrado. Por favor usar una ID valida.`)
        })
})


/* Add product */
router.post('/', async (req, res) => {
    const productInfo = req.body
    const newProduct = await pm.addProduct(productInfo)
    res.json({ message: 'Producto creado con exito', newProduct })
});



/* Modify product */
router.put('/:idProducts', async (req, res) => {
    const { idProducts } = req.params;
    const field = Object.keys(req.body)[0];
    const value = req.body[field];

    try {
        const product = await productsModel.findByIdAndUpdate(idProducts, { [field]: value }, { new: true });
        res.json({ message: "Producto editado correctamente", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al editar el producto" });
    }
});

/* Delete specific id */

router.delete('/:idProducts', async (req, res) => {
    const { idProducts } = req.params;

    try {
        const product = await productsModel.findByIdAndDelete(idProducts);
        if (product) {
            res.json({ message: `Producto con ID ${idProducts} eliminado correctamente.` });
        } else {
            res.status(404).json({ message: `No se encontró el producto con ID ${idProducts}.` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar el producto" });
    }
});
export default router

