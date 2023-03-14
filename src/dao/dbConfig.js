import mongoose from "mongoose";

const URI = 'mongodb+srv://felipepouyssegur:shackelton123@cluster0.qfuwqnn.mongodb.net/ecommerceCoder?retryWrites=true&w=majority'

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true }, (error) => {
    if (error) {
        console.log('Error al conectarse con la base de datos ❌')
    } else {
        console.log('Conectado a la base de datos 🆗')
    }
})