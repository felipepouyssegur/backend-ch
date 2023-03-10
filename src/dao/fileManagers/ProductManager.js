import fs from 'fs';

export class ProductManager {
    constructor(path) {
        this.path = path;
    }

    async #validateProduct(product) {
        if (
            product.category !== "" &&
            product.name !== "" &&
            product.description !== "" &&
            product.price !== "" &&
            product.image !== "" &&
            product.code !== "" &&
            product.stock !== ""
        ) {
            const products = await this.getProducts();
            let flag = false;
            products.forEach((element) => {
                if (element.code === product.code) {
                    flag = true;
                    return false;
                }
            });
            if (!flag) {
                return true;
            }
        } else {
            return false;
        }
    }

    async getProducts() {
        if (fs.existsSync(this.path)) {
            const products = await fs.promises.readFile(this.path, 'utf-8')
            return JSON.parse(products);
        } else {
            await fs.writeFile(this.path, "[]");
            return await fs.readFile(this.path, "utf8");
        }
    }

    async addProduct(product) {
        const products = await this.getProducts();
        const id = products[products.length - 1].id + 1
        product.id = id

        if (await this.#validateProduct(product)) {
            products.push(product);
            await fs.promises.writeFile(this.path, JSON.stringify(products, null, '\t'), 'utf-8')
            return "✅ Producto agregado con exito ✅";
        } else {
            return "❌ No se pudo agregar el producto ❌";
        }
    }

    async getProductById(id) {
        const products = await this.getProducts();
        const prod = products.find(product => product.id === id);
        return prod;
    }

    async deleteProduct(id) {
        const products = await this.getProducts();
        const newProducts = products.filter((product) => product.id !== id);
        await fs.promises.writeFile(this.path, JSON.stringify(newProducts));
        return "Producto eliminado con exito";
    }

    async updateProduct(id, field, value) {
        let estado = await this.getFile();
        const result = estado.find((x) => x.id === id);
        const restEstado = estado.filter((x) => x.id != id);
        result[field] = value;
        let concatenado = restEstado.concat(result);

        if (!id || !field || !value) {
            console.log("→ → → Error : Deben completarse todos los campos");
        } else {
            fs.promises.writeFile(this.path, JSON.stringify(concatenado));
            console.log(`ID ${id} modificado correctamente`);
        }
    }

    async getFile() {
        try {
            if (fs.existsSync(this.path)) {
                const productos = await fs.promises.readFile(this.path, "utf-8");
                const productosJS = JSON.parse(productos);
                return productosJS;
            } else {
                return [];
            }
        } catch (error) {
            console.log(" → → → CA ERROR!", error);
        }
    }
}

export default ProductManager;
