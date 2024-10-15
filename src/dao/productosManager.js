import fs from "fs"

export class productosManager{
    static #path=""

    static setPath(rutaArchivo=""){
        this.#path=rutaArchivo
    }

    static async getProducts(){
        if (fs.existsSync(this.#path)){
            return JSON.parse(await fs.promises.readFile(this.#path,{encoding:"utf-8"}))
        } 
        else {
            return []
        }
    }

    static async #guardarArchivo (datos=""){
        if (typeof datos != "string"){
            throw new Error ("Error - Los tipos de datos que se quieren guardar no son los correctos!!")
        }
        await fs.promises.writeFile(this.#path, datos)
    }

    static async addProduct(product={}){
        let productos = await this.getProducts();
        
        let pid=1
        if(productos.length>0){
            pid=Math.max(...productos.map(d=>d.pid))+1
        }

        let nuevoProducto = { 
            pid,
            ...product
        }
        productos.push(nuevoProducto)
        await this.#guardarArchivo(JSON.stringify(productos, null, 5))

        return nuevoProducto
    }

    static async updateProduct(pid, body={}){
        let productos = await this.getProducts();
        let index = productos.findIndex(producto => producto.pid === pid);

        if (index !== -1){
            productos[index] = { 
                ...productos[index], 
                ...body 
            };
        }

        await this.#guardarArchivo(JSON.stringify(productos, null, 5))
        return productos[index]
    }

    static async deleteProduct(pid){
        let productos = await this.getProducts();
        let productosActualizados = productos.filter(producto => producto.pid !== pid);
        await this.#guardarArchivo(JSON.stringify(productosActualizados, null, 5))

        return
    }
}