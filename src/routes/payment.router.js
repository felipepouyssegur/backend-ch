import { Router } from "express";
import config from "../config.js";
import stripe from 'stripe';
import { cartsModel } from "../dao/models/carts.model.js";

const router = Router();
const stripeSecretKey = config.stripe_private_key;

const stripeClient = new stripe(stripeSecretKey);

router.post('/', async (req, res) => {
    const { cartId } = req.body;
    console.log(cartId)
    try {
        // Aquí se realiza la lógica para obtener los detalles del carrito y calcular el monto total

        // Obtener los detalles de los productos en el carrito
        const cart = await cartsModel.findById(cartId);

        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }
        const lineItems = cart.products.map(product => {
            return {
                price_data: {
                    currency: 'USD', // Cambia la moneda según tus necesidades
                    product_data: {
                        name: product.name,
                        // Puedes incluir más detalles del producto según tus necesidades
                    },
                    unit_amount: product.price * 100, // Multiplica el precio por 100 si utilizas una moneda con decimales
                },
                quantity: product.quantity,
            };
        });

        // Crea una sesión de pago en Stripe
        const session = await stripeClient.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            success_url: '/',
            cancel_url: '/error',
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la sesión de pago' });
    }
});

export default router;