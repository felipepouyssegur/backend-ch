import { Router } from "express";
import ChatManager from "../dao/mongoManagers/ChatManager.js";

const router = Router();
const cm = new ChatManager()

router.get('/', async (req, res) => {
    try {
        const messages = await cm.getAllMessages(); // Obtener mensajes de la base de datos
        res.render('chat', { messages }); // Renderizar plantilla handlebars con mensajes

    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener mensajes del chat');
    }
});

export default router;