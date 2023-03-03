import express from 'express'
import { Server } from 'socket.io'
import { __dirname } from './utils.js'
import handlebars from 'express-handlebars'
import './dao/dbConfig.js'

import productsRouter from './routes/products.router.js';
import cartRouter from './routes/cart.router.js'
import viewsRouter from './routes/views.router.js'


import ChatManager from "./dao/mongoManagers/ChatManager.js";
const cm = new ChatManager()

const app = express()

/* archivos estaticos en public */
app.use(express.static(__dirname + '/public'))



/* SIEMPRE TENGO QUE PONER ESTO CON EXPRESS (PARA QUE ENTIENDA CUALQUIER FORMATO) */
app.use(express.json())
app.use(express.urlencoded({ extended: true }))



/* Handlebars */
app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars')
app.set('views', __dirname + '/views')



/* ROUTER */

app.use('/api/products', productsRouter)
app.use('/api/cart', cartRouter)
app.use('/', viewsRouter)




/* SERVER */


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/chat', (req, res) => {
    res.render('chat')

})

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts')
})


const PORT = process.env.PORT || 3000

const httpServer = app.listen(PORT, () => {
    console.log('-----------------------------------------------------------------------')
    console.info('      ✅ El servidor esta corriendo en: http://localhost:3000')
    console.warn('      🔊 Escuchando el puerto 3000')
    console.log('-----------------------------------------------------------------------')
})

export const socketServer = new Server(httpServer)

socketServer.on('connection', socket => {



    console.log('✅ Cliente conectado.')

    console.log('🛅 Su ID es:', socket.id)



    socket.on('chatmessage', (msg) => {

        console.log(`Message received: ${msg.user}: ${msg.message}`);

        const obj = {

            user: msg.user,

            message: msg.message

        }

        socket.emit('chat', obj);

        /* guardo el mensaje en la db */
        cm.addMessage(obj.user, obj.message,);

        const messages = cm.getAllMessages();
        socket.emit('allMessages', messages);
        console.log(messages)
    });



    socket.on('disconnect', () => {

        console.log('⛔ Cliente desconectado')

    })



})







