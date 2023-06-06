import supertest from "supertest";
import { expect } from "chai";
import mongoose from "mongoose";
import './db.js'
import { cartsModel } from "../src/dao/models/carts.model.js";

const request = supertest('http://localhost:3000')

const productMock1 = {
    name: 'WebCam',
    price: 30000,
    description: 'WebCam HD',
    thumbnail: 'https://i.ibb.co/54pQZys/image.png',
    stock: 100,
    category: 'Tecnologia',
    status: true
}

const userMock = {
    role: 'admin',
    _id: 'testUserID'
};

describe('Testing CRUD de products', function () {
    describe('GET en api/products', function () {
        it('Probar que el metodo GET / (api/products) devuelva todos los productos', async function () {
            const response = await request.get('/api/products');
            const products = response.body.products.docs;

            expect(response.status).to.equal(200); // Verifica que el estado de la respuesta sea 200 (OK)
            expect(products).to.be.an('array'); // Verifica que los productos sean un arreglo

            // Verifica que haya al menos un producto en la respuesta
            expect(products.length).to.be.greaterThan(0);

        });
        describe(':idProducts', function () {
            it('Debería devolver un mensaje de error si el ID no es válido', async function () {
                const response = await request.get('/api/products/invalidID');

                expect(response.status).to.equal(200);
                expect(response.body).to.deep.equal('Producto con ID: invalidID no encontrado. Por favor usar una ID valida.');
            });

            it('Debería devolver un mensaje de éxito y el producto si el ID es válido', async function () {
                const response = await request.get('/api/products/64661d550038114598e24088');

                expect(response.status).to.equal(200);
                expect(response.body.message).to.equal('Producto con id 64661d550038114598e24088 encontrado');
                expect(response.body.product).to.be.an('object');
            });
        });

    });
    describe('POST en api/products', function () {
        it('Debería crear un nuevo producto y devolver una respuesta exitosa', async function () {

            // Enviar una solicitud POST al endpoint /api/products con los datos del producto
            const response = await request.post('/api/products').send({ ...productMock1, user: userMock })

            // Verificar que la respuesta tenga el código de estado correcto (200)
            expect(response.status).to.equal(200);

            // Verificar el contenido de la respuesta
            expect(response.body).to.have.property('message', 'Producto creado con éxito');
            expect(response.body).to.have.property('newProduct');
        });

        it('Debería devolver un mensaje de error si ocurre un problema al crear el producto', async function () {
            // Datos de ejemplo para enviar en la solicitud POST
            const invalidProductData = {
                description: 'WebCam HD',
                thumbnail: 'https://i.ibb.co/54pQZys/image.png',
                category: 100,
            };

            // Enviar una solicitud POST al endpoint /api/products con los datos de producto inválidos
            const response = await request.post('/api/products').send(invalidProductData);

            expect(response.status).to.equal(500);

            expect(response.body).to.have.property('message', 'Error al crear el producto');
        });

    })
});

describe('Testing CRUD de cart', function () {
    const idCart = '647f4723e737d5ffc5408974'
    const idProduct = '64661d550038114598e24088'
    it('Metodo POST en /api/cart debe crear un cart con ID autogenerada, array vacio', async function () {
        const response = await request.post('/api/cart')
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('string');
    })
    describe('GET en /api/cart/:cartId', function () {
        it('Debería mostrar los productos dentro del carrito con el ID especificado', async function () {



            const response = await request.get(`/api/cart/${idCart}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('cart');
            expect(response.body.cart).to.be.an('object');
        });
    });

    describe('DELETE en /api/cart/:idCart/products/:idProduct', function () {
        it('Debería eliminar un producto del carrito y devolver un mensaje de éxito', async function () {

            // Realizar una solicitud DELETE al endpoint /api/cart/:idCart/products/:idProduct
            const response = await request.delete(`/api/cart/${idCart}/products/${idProduct}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('message', 'Producto eliminado del carrito');
        });

        it('Debería devolver un mensaje de error si el carrito no existe', async function () {
            // Realizar una solicitud DELETE al endpoint /api/cart/:idCart/products/:idProduct
            const response = await request.delete(`/api/cart/${idCart}/products/${idProduct}`);

            expect(response.status).to.equal(404);

        });

        it('Debería devolver un mensaje de error si el producto no existe en el carrito', async function () {

            // Realizar una solicitud DELETE al endpoint /api/cart/:idCart/products/:idProduct
            const response = await request.delete(`/api/cart/${idCart}/products/${idProduct}`);

            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('message', 'Producto no encontrado en el carrito');

        });
    });

})




