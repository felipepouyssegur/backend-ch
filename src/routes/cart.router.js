import { Router } from "express";
import CartManager from "../clases/CartManager.js";


const cm = new CartManager();
const router = Router()

/* GetPurchase */
router.get('/', async (req, res) => {
    let cart = await cm.getPurchases(parseInt());
    res.json(cart)
})


/* GetById */
router.get('/:pid', (req, res) => {
    let { pid } = req.params;
    let purch = cm.getPurchaseById(parseInt(pid));
    res.json(purch)
})

/* Agregar producto */
router.post('/:pid', (req, res) => {
    const id = req.params.id;
    const cartManager = new CartManager();
    cartManager.addProductToCart(id, (err) => {
        if (err) {
            return res.status(500).send({
                message: "Error al agregar producto al carrito",
            });
        }
        return res.send({
            message: "Producto agregado al carrito con éxito",
        });
    });
})

/* Delete */
router.delete(('/:pid'), (req, res) => {
    let { pid } = req.params;
    let del = cm.deletePurchase(parseInt(pid))
    res.json(del)
})

export default router