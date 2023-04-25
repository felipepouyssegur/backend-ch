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
    try {
        const newProduct = await pm.addProduct(req.body);
        res.json({ message: 'Producto creado con éxito', newProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el producto' });
    }
});



/* Modify product */
router.post('/:idProducts', async (req, res) => {
    const { idProducts } = req.params;
    const updateFields = req.body;

    try {
        const product = await productsModel.findById(idProducts);
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        for (const [key, value] of Object.entries(updateFields)) {
            product[key] = value;
        }

        const updatedProduct = await product.save();
        res.json({ message: "Producto editado correctamente", product: updatedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al editar el producto" });
    }
});


/* Delete specific id */
/* Estoy usando method-override, por eso el router.post y no router.delete */

router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedProduct = await productsModel.findByIdAndDelete(id);
        if (deletedProduct) {
            res.json({ message: `Producto con ID ${id} eliminado correctamente.` });
        } else {
            res.status(404).json({ message: `No se encontró el producto con ID ${id}.` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar el producto" });
    }
});



export default router

