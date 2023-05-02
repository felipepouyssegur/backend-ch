import { Router } from "express";
import { faker } from '@faker-js/faker';

const router = Router()

router.get('/', (req, res) => {
    const products = [];
    for (let i = 0; i < 100; i++) {
        const product = {
            name: faker.commerce.productName(),
            price: faker.commerce.price(),
            description: faker.commerce.productDescription(),
            thumbnail: faker.image.technics(500, 500, true),
            stock: faker.commerce.price(0, 50, 0),
            category: faker.commerce.department(),
            status: true
        };
        products.push(product);
    }
    res.json(products);
});

export default router