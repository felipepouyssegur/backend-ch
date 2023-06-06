import mongoose from "mongoose";
import config from "../config.js";

const URI = config.mongo_uri

try {
    await mongoose.connect(URI)
    console.log('Conectado a la base de datos 🆗')
} catch (error) {
    console.log('Error al conectarse con la base de datos ❌')
}

