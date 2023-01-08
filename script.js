/* LOGICA */

class Product {
    constructor(title, description, price, thumbnail, code, stock) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.thumbnail = thumbnail;
        this.code = code;
        this.stock = stock;
    }

    setId(id) {
        this.id = id;
    }
}

class ProductManager {
    #products
    constructor() {
        this.#products = [];
        this.idManager = 1;
    }

    validateProduct(product) {
        let flag = false;
        this.#products.forEach((producto) => {
            producto.code === product.code && (flag = true);
        });
        if (!flag) {
            if (
                product.title !== "" &&
                product.description !== "" &&
                product.price !== "" &&
                product.thumbnail !== "" &&
                product.code !== "" &&
                product.stock !== ""
            ) {
                return true;
            } else {
                return `ERROR: No se cargo ${product.title}, por favor revisar que no haya casilleros vacios.`;
            }
        } else {
            return `ERROR: ${product.title} tiene el mismo codigo que otro producto en su lista.`;
        }
    }

    addProduct(product) {
        const validacion = this.validateProduct(product)
        if (validacion === true) {
            product.setId(this.idManager);
            this.idManager += 1;
            this.#products.push(product);
            return `Carga de producto ${product.title} exitosa.`
        } else {
            return validacion
        }
    }

    getProdcuts() {
        return this.#products
    }

    getProductById(id) {
        return (this.#products.find(product => product.id === id)) || 'Error: Producto no encontrado'
    }
}

/* DEFINICIONES */

const producto1 = new Product("Computadora", "Tecnologia", 300000, "a", 4040, 40);

const producto2 = new Product("Teclado", "Tecnologia", 10000, "b", 1030, 60);

const producto3 = new Product("Mouse", "Tecnologia", 8000, "c", 4040, 30);

const producto4 = new Product('Monitor', '', '', '', '', '')

const ManejadorProductos = new ProductManager();

/* LOGS */

console.log(ManejadorProductos.addProduct(producto1))

console.log(ManejadorProductos.addProduct(producto2))

console.log(ManejadorProductos.addProduct(producto3)) //mismo codigo que producto 1, tiene que dar error

console.log(ManejadorProductos.addProduct(producto4)) //este producto contiene casilleros vacios, tiene que dar error


/* GET */

console.log('getProducts 👇')
console.log(ManejadorProductos.getProdcuts())

console.log('getProductById 👇')
console.log(ManejadorProductos.getProductById(2))

console.log('getProductById (debe dar error) 👇')
console.log(ManejadorProductos.getProductById(20)) 