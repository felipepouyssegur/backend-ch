import mongoose from "mongoose";

const URI = 'mongodb+srv://felipepouyssegur:shackelton123@cluster0.qfuwqnn.mongodb.net/ecommerceCoder?retryWrites=true&w=majority'

try {
    await mongoose.connect(URI)
    console.log('Conectado a la base de datos 🆗')
} catch (error) {
    console.log('Error al conectarse con la base de datos ❌')
}

