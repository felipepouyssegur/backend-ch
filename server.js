import express from 'express'
import { ProductManager } from './src/clases/ProductManager.js';
import { __dirname } from './utils.js'
import handlebars from 'express-handlebars'

import productsRouter from './src/routes/products.router.js';
import cartRouter from './src/routes/cart.router.js'


const pm = new ProductManager('./src/storage/products.json');

const app = express()

/* SIEMPRE TENGO QUE PONER ESTO CON EXPRESS (PARA QUE ENTIENDA CUALQUIER FORMATO) */

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


/* creamos dirname (path absoluto) */

app.use(express.static(__dirname + 'public')) /* forma para decirle al sv que puede acceder a public */




/* motor de plantilla (handlebars) */

/* app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/src/views')
app.set('view engine', 'handlebars')

app.get('/', (req, res) => {
    res.render('vista1')
})

app.get('/vista2', (req, res) => {
    res.render('vista2')
}) */



/* ROUTER */

app.use('/api/products', productsRouter)
app.use('/api/cart', cartRouter)


/* SERVER */

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




