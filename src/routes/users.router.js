
import { Router } from "express";
import { userModel } from "../dao/models/users.models.js";
import { transporter } from "../nodemailer.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router()

/* muestro todos los users */
router.get('/', (req, res) => {
    userModel.find({}, 'username email role', (err, users) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al obtener los usuarios' });
        }
        res.json(users);
    });
});

/* elimino users con 2 dias de inactividad */
router.delete('/', async (req, res) => {
    const inactiveSince = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // Obtén la fecha límite de inactividad (2 días atrás)

    try {
        // Busca los usuarios inactivos
        const inactiveUsers = await userModel.find({ last_connection: { $lt: inactiveSince } });

        // Verifica si hay usuarios inactivos
        if (inactiveUsers.length === 0) {
            return res.send('No hay usuarios inactivos');
        }

        // Envía el correo electrónico de eliminación a cada usuario inactivo
        for (const user of inactiveUsers) {
            const email = user.email;

            if (!email) {
                console.log('Correo electrónico no definido para el usuario:', user._id);
                continue;
            }

            // Define el contenido del correo electrónico
            const correoElectronico = {
                from: 'correo_remitente@gmail.com',
                to: email,
                subject: 'Eliminación de cuenta por inactividad',
                html: '<p>Su cuenta de E-Commerce Coder ha sido eliminada debido a inactividad.</p>',
            };

            // Envía el correo electrónico
            await transporter.sendMail(correoElectronico);
            console.log(`Correo electrónico enviado a ${email}`);
        }

        // Elimina los usuarios inactivos de la base de datos
        await userModel.deleteMany({ last_connection: { $lt: inactiveSince } });

        res.send('Usuarios inactivos eliminados correctamente');
    } catch (error) {
        console.error('Error al eliminar usuarios inactivos:', error);
        res.status(500).send('Error al eliminar usuarios inactivos');
    }
});

/* muestro vista de admin */
router.get('/admin', isAdmin, async (req, res) => {
    try {
        // Obtén la lista de usuarios desde la base de datos
        const users = await userModel.find().lean();
        // Renderiza la vista de usuarios con los datos obtenidos
        res.render('users', { users, layout: "main" });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener usuarios');
    }
});

/* modifico rol del user */

router.post('/admin/:userId', async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    try {
        await userModel.findByIdAndUpdate(userId, { role });
        res.json(`Rol del usuario modificado correctamente a: ${role}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar el rol del usuario');
    }
});

/* elimino user */

router.post('/admin/delete/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        await userModel.findByIdAndDelete(userId);
        res.json('Usuario eliminado correctamente'); // Otra página de tu elección después de eliminar el usuario
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar el usuario');
    }
});
export default router
