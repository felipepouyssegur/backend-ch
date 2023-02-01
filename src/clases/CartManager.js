import fs from "fs";
import ProductManager from "../clases/ProductManager.js";

export default class CartManager {
    construct(productManager) {
        this.productManager = productManager;
        this.cart = [];
        // this.cart = [];
        // this.path=path;
    }

    addToCart(id) {
        const getProds = this.#getProds();
        let getItem = getProds.find((x) => x.id === id);

        let getCart = this.getPurchases();

        let purch = {
            id: getItem.id,
            title: getItem.title,
            quantity: 1
        }

        const getCartProd = getCart.find((x) => x.id === id);

        if (getCartProd) {
            const getCartRest = getCart.filter((x) => x.id != id); // consigo los restantes
            purch.quantity = getCartProd.quantity + 1;
            let concatenados = getCartRest.concat(purch);
            fs.writeFileSync('./src/storage/cart.json', JSON.stringify(concatenados));
            return `Producto agregado Anteriormente. Se sumó una Unidad.`;
        } else {
            getCart.push(purch);
            fs.writeFileSync('./src/storage/cart.json', JSON.stringify(getCart))
            return `Producto agregado correctamente:`;
        };
    }

    getPurchases() {
        if (fs.existsSync('./src/storage/cart.json')) {
            const readFile = fs.readFileSync('./src/storage/cart.json', 'utf-8');
            const readFileJS = JSON.parse(readFile);
            return 'su compra', readFileJS;
        } else {
            return [];
        }
    }

    getPurchaseById(id) {
        const getProds = this.getPurchases();
        const searchId = getProds.find((x) => x.id === id);
        if (searchId) {
            return searchId
        } else {
            return '❌ Producto no encontrado. ❌'
        }
    }

    deletePurchase(id) {
        const getProds = this.getPurchases(id);
        let validation = getProds.find((x) => x.id == id);

        if (validation) {
            let searchOthers = getProds.filter((x) => x.id != id);
            fs.writeFileSync('./src/storage/cart.json', JSON.stringify(searchOthers));
            return `Elemento con id: ${id} eliminado correctamente.`;
        } else {
            return `Elemento con id: ${id} no encontrado`;
        }

    }

    #getProds() {
        try {
            if (fs.existsSync("/src/storage/cart.json")) {
                // * * * Buscar manera para que sea DINAMICO
                const getProds = fs.readFileSync("/src/storage/cart.json", "utf-8");
                const getProdsJS = JSON.parse(getProds);
                return getProdsJS;
            } else {
                return [];
            }
        } catch (error) {
            console.log("→ ERROR: ", error);
        }
    }

    addProductToCart(id, cb) {
        // leer el archivo cart.json
        fs.readFile('./src/storage/cart.json', "utf-8", (err, data) => {
            if (err) return cb(err);
            let cart;
            try {
                cart = JSON.parse(data);
            } catch (err) {
                return cb(err);
            }
            // agregar el nuevo producto al carrito
            cart.products.push(id);
            // escribir el archivo cart.json
            fs.writeFile('./src/storage/cart.json', JSON.stringify(cart), cb);
        });
    }
}


export class CartManager2 {
    constructor(path) {
        this.path = path;
    }

    async getCart() {
        if (fs.existsSync(this.path)) {
            const cart = await fs.promises.readFile(this.path, 'utf-8');
            return JSON.parse(cart);
        } else {
            await fs.writeFile(this.path, '[]');
            return [];
        }
    }

    async addProductToCart(productId) {
        let cart = await this.getCart();
        let id = cart.length > 0 ? cart[cart.length - 1].id + 1 : 1;

        const productManager = new ProductManager('./src/routes/products.router.js');
        const product = await productManager.getProductById(productId);
        if (!product) {
            return '❌ Product not found ❌';
        }

        const item = { id, product };
        cart.push(item);
        await fs.promises.writeFile(this.path, JSON.stringify(cart, null, '\t'), 'utf-8');
        return `✅ Product with id ${productId} added to cart with id ${id} ✅`;
    }
}
