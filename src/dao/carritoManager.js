import fs from "fs"

export class carritoManager {
    static #path = ""

    static setPath(rutaArchivo = "") {
        this.#path = rutaArchivo
    }

    static async getCarts() {
        if (fs.existsSync(this.#path)) {
            return JSON.parse(await fs.promises.readFile(this.#path, { encoding: "utf-8" }))
        }
        else {
            return []
        }
    }

    static async #guardarArchivo(datos = "") {
        if (typeof datos != "string") {
            throw new Error("Error - Los tipos de datos que se quieren guardar no son los correctos!!")
        }
        await fs.promises.writeFile(this.#path, datos)
    }

    static async addCart(products = {}) {
        let carritos = await this.getCarts();

        let cid = 1
        if (carritos.length > 0) {
            cid = Math.max(...carritos.map(d => d.cid)) + 1
        }

        let nuevoCarrito = {
            cid,
            ...products
        }
        carritos.push(nuevoCarrito)
        await this.#guardarArchivo(JSON.stringify(carritos, null, 5))

        return nuevoCarrito
    }

    static async putCart(cart = {}) {
        let carritos = await this.getCarts();
        
        const index = carritos.findIndex(c => c.cid === cart.cid);
        carritos[index] = cart;

        await this.#guardarArchivo(JSON.stringify(carritos, null, 5))

        return
    }
}