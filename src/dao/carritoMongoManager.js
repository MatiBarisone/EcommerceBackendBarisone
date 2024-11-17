import { carritoModelo } from "./models/carrito.model.js"

export class carritoMongoManager {
    static async getCarts() {
        return await carritoModelo.find().lean().populate("products.pid")
    }

    static async addCart(products = {}) {
        let nuevoCarrito = await carritoModelo.create(products)
        return nuevoCarrito.toJSON()
    }

    static async putInCart(id, cart = {}) {
        return await carritoModelo.findByIdAndUpdate(id, cart, {new:true}).lean()
    }

}