import ProductManager from '../dao/mongoManagers/ProductManager.js'
import { Router } from 'express'
import { cartsModel } from '../dao/models/carts.model.js';
import { productsModel } from '../dao/models/products.model.js';
import { isLoggedIn, isLoggedOut, socketServer } from '../server.js';
import { } from '../server.js';
import { userModel } from '../dao/models/users.models.js';
import bcrypt from 'bcrypt'
import passport from 'passport';


const router = new Router()
const pm = new ProductManager();


// Vista para ser utilizada con protocolo http, layout home,
/* router.get('/', async (req, res) => {
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

    res.render('home', { products: productosObtenidos, layout: "main" });
}); */

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

    res.render('products', { products: productosObtenidos, layout: "main" });
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
}))

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
    const { username, password } = req.body;
    try {
        const existingUser = await userModel.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }
        const hash = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            username,
            password: hash,
        });
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
});

/* Admin */

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
                password: hash
            });

            newAdmin.save();

            res.redirect('/login');
        });
    });
});






















export default router