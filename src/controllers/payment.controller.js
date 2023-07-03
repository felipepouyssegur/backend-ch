import stripe from 'stripe';
import config from '../config';

const stripeAPI = stripe(config.stripe_private_key);

export const createPayment = async (req, res) => {
    const { idCart } = req.params;
    try {
        // Obtener los datos necesarios para procesar el pago
        const { amount, cardNumber, cardExpMonth, cardExpYear, cardCVC } = req.body;

        // Crear una transacción en Stripe
        const paymentIntent = await stripeAPI.paymentIntents.create({
            amount,
            currency: 'USD',
            payment_method_data: {
                type: 'card',
                card: {
                    number: cardNumber,
                    exp_month: cardExpMonth,
                    exp_year: cardExpYear,
                    cvc: cardCVC,
                },
            },
        });

        // Realizar el pago
        const result = await stripeAPI.paymentIntents.confirm(paymentIntent.id);

        // Aquí puedes guardar información adicional del pago en tu base de datos

        res.status(200).json({ message: 'Pago realizado exitosamente', result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al procesar el pago' });
    }
};