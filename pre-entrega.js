const ProdManager = require('./clases/ProductManager.js')

const pm = new ProdManager.ProductManager('./storage/products.json');

console.log(pm.getProducts())


console.log(pm.addProduct("Computadora", "Producto de Tecnologia, PC", 300000, "https://images.pexels.com/photos/1672304/pexels-photo-1672304.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", 1000, 250))



console.log(pm.getProductById(2)) //Muestra por consola el producto



/* Timeouts para visualizar los cambios en products.json 

(descomentar luego de crear products.json) */

setTimeout(() => {
    console.log(pm.updateProduct(2, 'title', 'PC Gamer'))
}, 2000)

setTimeout(() => {
    console.log(pm.deleteProduct(2))
}, 5000)