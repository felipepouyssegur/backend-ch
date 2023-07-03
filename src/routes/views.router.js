import ProductManager from '../dao/mongoManagers/ProductManager.js'
import { Router } from 'express'
import { cartsModel } from '../dao/models/carts.model.js';
import { productsModel } from '../dao/models/products.model.js';
import { isLoggedIn, isLoggedOut } from '../passport/passportStrategies.js';
import { userModel } from '../dao/models/users.models.js';
import bcrypt from 'bcrypt'
import passport from 'passport';
import { Strategy as GitHubStrategy } from "passport-github2";
import { config } from 'dotenv';
import { generateToken } from '../utils.js';
import { jwtValidation } from '../middlewares/jwt.middleware.js';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser'
import { transporter } from "../nodemailer.js";
import mongoose from 'mongoose';
const secretKey = 'mi-clave-secreta'

config()

const router = new Router()
const pm = new ProductManager();


// Vista para ser utilizada con protocolo WebSocket, layout home
router.get('/realtimeproducts', async (req, res) => {
    const { limit } = req.query;
    const products = await pm.getAllProducts();

    // Convert ObjectId properties to strings
    const productsFormatted = products.map(product => {
        return {
            ...product.toObject(),
            _id: product._id.toString()
        };
    });

    const productosObtenidos = productsFormatted.slice(0, limit);

    res.render('realTimeProducts', { products: productosObtenidos, layout: "main" });
});

/* Products */


router.get('/products', isLoggedIn, async (req, res) => {

    const { limit } = req.query;
    const products = await pm.getAllProducts();

    // Convert ObjectId properties to strings
    const productsFormatted = products.map(product => {
        return {
            ...product.toObject(),
            _id: product._id.toString()
        };
    });

    const productosObtenidos = productsFormatted.slice(0, limit);

    const user = req.user; // Obtiene el usuario actual de la sesión

    let userWithOwnProperty = null;
    let cart = null
    if (user) {
        // Agregar una propiedad "own property" username al objeto user
        const userCart = user.cart // Convertir ObjectId a string
        userWithOwnProperty = { ...user, username: user.username, cart: userCart };
        console.log(userCart)
    }




    let isAdmin = false; // Define isAdmin como falso por defecto
    let isPremium = false;
    let isUser = false

    if (user && user.role === 'admin' || user && user.role === 'premium') {
        isAdmin = true; // Si el usuario es admin, cambia el valor de isAdmin a verdadero
    }

    try {
        const currentTime = new Date();
        console.log(currentTime)
        const uid = user._id.toString()
        await userModel.findByIdAndUpdate(uid, { last_connection: currentTime });
    } catch (error) {
        console.log(error)
    }




    res.render('products', {
        products: productosObtenidos,
        user: userWithOwnProperty,
        isAdmin: isAdmin,
        isPremium: isPremium,
        isUser: isUser,
        layout: "main",
    });
});

/* duplicate */
router.put('/api/users/premium/:uid', async (req, res) => {
    try {
        const { uid } = req.params; // Obtiene el ID del usuario de los parámetros de la ruta
        const user = await userModel.findById(uid); // Busca el usuario por su ID en la base de datos

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Cambia el rol del usuario
        user.role = user.role === 'user' ? 'premium' : 'user';

        // Guarda los cambios en la base de datos
        await user.save();

        res.json({ message: 'Rol de usuario actualizado exitosamente', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el rol de usuario' });
    }

})




/* Cart */


router.get('/cart/:idCart', async (req, res) => {
    const { idCart } = req.params;

    try {
        const isValidObjectId = mongoose.Types.ObjectId.isValid(idCart);

        if (!isValidObjectId) {
            return res.status(400).send('Invalid cart ID');
        }

        const cart = await cartsModel.findById(idCart);

        if (!cart) {
            return res.status(404).send('Cart not found');
        }

        const productDetails = await Promise.all(
            cart.products.map(async (product) => {
                const productDetail = await productsModel.findById(product.id);

                if (!productDetail) {
                    return null;
                }

                return {
                    ...productDetail.toObject(),
                    quantity: product.quantity,
                };
            })
        );

        const filteredProductDetails = productDetails.filter(
            (productDetail) => productDetail !== null
        );

        res.render('cart', { products: filteredProductDetails, idCart: idCart, layout: "main" });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving cart');
    }
});




/* Sign up */

router.get('/', isLoggedIn, (req, res) => {
    res.render('signup', { title: 'Home' })
})

/* Login */

router.get('/login', isLoggedOut, (req, res) => {
    const response = {
        title: 'Login',
        error: req.query.error
    }

    res.render('login', response)
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/products',
    failureRedirect: '/login?error=true'
}));


router.post('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

/* registro */

router.get('/signup', isLoggedOut, (req, res) => {
    res.render('signup', { title: 'Sign up' })
})

router.post('/signup', async (req, res) => {
    const { username, password, email, age, first_name, last_name } = req.body;

    /* verificacion gmail */
    const emailRegex = /@gmail\.com$/;
    if (!emailRegex.test(email)) {
        return res.status(400).send('Invalid email format');
    }

    try {

        const existingUser = await userModel.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }
        const existingEmail = await userModel.findOne({ email });
        if (existingEmail) {
            return res.status(400).send('Email already exists');
        }
        const hash = await bcrypt.hash(password, 10);

        const cart = new cartsModel({ products: [] });
        const savedCart = await cart.save();


        const newUser = new userModel({
            username,
            password: hash,
            first_name,
            last_name,
            email,
            age,
            cart: savedCart._id,
            last_connection: new Date()
        });


        await newUser.save();
        const token = jwt.sign({ user: newUser.username }, 'secretJWT', { expiresIn: '1h' })

        /* res.status(200).json({ user: userData, cartId: savedCart._id }); */
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 })
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
});


/* Registro con GITHUB */

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
},
    function (accessToken, refreshToken, profile, done) {
        // Aquí debes crear una nueva instancia de UserModel con los datos del usuario
        // y guardarla en la base de datos utilizando el método create de Mongoose
        const user = new userModel({
            username: profile.username,
            password: profile.username,
            first_name: profile.username,
            last_name: profile.username,
            age: 0,
            email: profile.username,
            role: 'user'
        });
        user.save((err) => {
            if (err) {
                return done(err);
            }
            done(null, user);
        });
    }));

router.get('/auth/github',
    passport.authenticate('github', { scope: ['user:email'] }));

router.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function (req, res) {
        // Si el usuario se ha autenticado correctamente, redirigirlo a la página /products
        const token = jwt.sign({ user: 'usuario' }, 'secretJWT', { expiresIn: '1h' })
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 })
        res.redirect('/products');
    });

/* CREAR Admin */

router.get('/setup', async (req, res) => {
    const exists = await userModel.exists({ username: "adminCoder@coder.com" });

    if (exists) {
        console.log('Ya existe un admin.')
        res.redirect('/login');
        return;
    };

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash("adminCod3r123", salt, function (err, hash) {
            if (err) return next(err);

            const newAdmin = new userModel({
                username: "adminCoder@coder.com",
                password: hash,
                role: 'admin'
            });

            newAdmin.save();

            res.redirect('/login');
        });
    });
});

/* reset password */

router.get('/reset-password', (req, res) => {
    res.render('resetPassword')
})

router.post('/reset-password', async (req, res) => {
    const { email } = req.body; // Obtiene el correo electrónico enviado desde el formulario

    try {
        // Genera el token con una fecha de expiración de 1 hora
        const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });

        // Genera el enlace utilizando el token
        const resetLink = `http://localhost:3000/reset-password/${token}`;

        // Define el contenido del correo electrónico
        const correoElectronico = {
            from: 'correo_remitente@gmail.com',
            to: email,
            subject: 'Restablecimiento de contraseña',
            html: `<p>Haga clic en el siguiente enlace para restablecer su contraseña:</p><a href="${resetLink}">${resetLink}</a>`,
        };

        // Envía el correo electrónico
        await transporter.sendMail(correoElectronico);
        console.log('Correo electrónico enviado:', correoElectronico);

        res.send('Correo electrónico enviado correctamente');
    } catch (error) {
        console.error('Error al enviar el correo electrónico:', error);
        res.status(500).send('Error al enviar el correo electrónico');
    }
});

router.get('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    res.render('resetPasswordForm', { token });
});

router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Verificar el token sin verificar la expiración
        const { email } = jwt.verify(token, secretKey, { ignoreExpiration: true });

        // Obtener el usuario por correo electrónico
        const user = await userModel.findOne({ email });

        // Comparar la nueva contraseña con la contraseña actual
        const isSamePassword = await bcrypt.compare(password, user.password);

        if (isSamePassword) {
            return res.status(400).send('No se puede utilizar la misma contraseña');
        }

        // Generar el hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Actualizar la contraseña del usuario en la base de datos
        user.password = hashedPassword;
        await user.save();

        res.send('Contraseña actualizada correctamente');
    } catch (error) {
        console.error('Error al actualizar la contraseña:', error);

        if (error.name === 'TokenExpiredError') {
            // Redirigir a una vista donde el usuario pueda generar nuevamente el correo de restablecimiento
            return res.redirect('/resetPassword');
        }

        res.status(500).send(`Error al actualizar la contraseña: ${error.message}`);
    }
});



export default router