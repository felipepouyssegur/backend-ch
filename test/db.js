import mongoose from "mongoose";
import config from "../src/config.js";

const URI = config.mongo_uri

mongoose
    .connect(URI)
    .then(() => { console.log('Conectado a la base de datos 🆗') })
    .catch((error) => console.log(error))


