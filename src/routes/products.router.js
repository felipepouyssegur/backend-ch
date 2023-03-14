import { Router } from "express";
import { productsModel } from "../dao/models/products.model.js";
/* import { ProductManager } from '../dao/fileManagers/ProductManager.js'; */
import ProductManager from '../dao/mongoManagers/ProductManager.js'



const router = Router()


const pm = new ProductManager();



/* getProducts para mostrar todos mis productos */
router.get('/', async (req, res) => {
    const { page = 1, limit = 10, sort, status, category } = req.query;
    let filter = {};
    let sortOrder = {};

    if (status) {
        filter.status = status === 'true';
    }

    if (category) {
        filter.category = category;
    }

    if (sort) {
        if (sort === 'descendente') {
            sortOrder = { price: -1 };
        } else if (sort === 'ascendente') {
            sortOrder = { price: 1 };
        }
    }

    const products = await productsModel.paginate(filter, { limit, page, sort: sortOrder });
    res.json({ products });
});


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

