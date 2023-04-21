import ProductManager from '../dao/mongoManagers/ProductManager.js'
import { Router } from 'express'
import { cartsModel } from '../dao/models/carts.model.js';
import { productsModel } from '../dao/models/products.model.js';
import { isLoggedIn, isLoggedOut } from '../passport/passportStrategies.js';
import { } from '../server.js';
import { userModel } from '../dao/models/users.models.js';
import bcrypt from 'bcrypt'
import passport from 'passport';
import { Strategy as GitHubStrategy } from "passport-github2";
import { config } from 'dotenv';
import { generateToken } from '../utils.js';
import { jwtValidation } from '../middlewares/jwt.middleware.js';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser'

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

router.get('/products', async (req, res) => {
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
    if (user) {
        // Agregar una propiedad "own property" username al objeto user
        userWithOwnProperty = { ...user, username: user.username, cart: user.cart };
    }

    let isAdmin = false; // Define isAdmin como falso por defecto

    if (user && user.role === 'admin') {
        isAdmin = true; // Si el usuario es admin, cambia el valor de isAdmin a verdadero
    }

    const welcomeMessage = user ? `Welcome, ${user.username}!` : '';

    res.render('products', {
        products: productosObtenidos,
        user: userWithOwnProperty,
        isAdmin: isAdmin,
        welcomeMessage: welcomeMessage,
        layout: "main",
    });
});

/* Cart */

router.get('/cart/:idCart', async (req, res) => {
    try {
        const { idCart } = req.params
        const cart = await cartsModel.findById(idCart);
        const productDetails = await Promise.all(cart.products.map(async (product) => {
            const productDetail = await productsModel.findById(product.id);
            return {
                ...productDetail.toObject(),
                quantity: product.quantity,
            };
        }));
        res.render('cart', { products: productDetails });
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
}
))

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
            cart: savedCart._id
        });


        await newUser.save();
        const token = jwt.sign({ user: newUser.username }, 'secretJWT', { expiresIn: '1h' })

        res.status(200).json({ user: userData, cartId: savedCart._id });
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






















export default router