import express from 'express'
import { __dirname } from './utils.js'
import handlebars from 'express-handlebars'
import { Server } from 'socket.io'

/* import productsRouter from './src/routes/products.router.js';
import cartRouter from './src/routes/cart.router.js' */




const app = express()

/* SIEMPRE TENGO QUE PONER ESTO CON EXPRESS (PARA QUE ENTIENDA CUALQUIER FORMATO) */

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


/* SOCKET IO */

app.use(express.static(__dirname + 'public'))



// forma para decirle al sv que puede acceder a public */

app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars')
app.set('views', __dirname + '/views')



/* ROUTER */

/* app.use('/api/products', productsRouter)
app.use('/api/cart', cartRouter)
 */

/* SERVER */

const httpServer = app.listen(8080, () => {
    console.log('-----------------------------------------------------------------------')
    console.info('      ✅ El servidor esta corriendo en: http://localhost:8080')
    console.warn('      🔊 Escuchando el puerto 8080')
    console.log('-----------------------------------------------------------------------')
})

const socketServer = new Server(httpServer)



/* Ruta madre */

app.get('/', (req, res) => {
    res.render('websocket')
})

socketServer.on('connection', () => {
    console.log('Usuario conectado.')
    console.log(socket)
})




