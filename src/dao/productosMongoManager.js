import { productosModelo } from "./models/productos.model.js"

export class productosMongoManager{
    static async getProducts(page=1, limit=10, query, sort){
        
        let filter = query ? JSON.parse(query) : {};

        let sortOption = {};
        if (sort === "asc") {
            sortOption = { price: 1 };
        } else if (sort === "desc") {
            sortOption = { price: -1 };
        }

        return await productosModelo.paginate(filter, {limit, page, lean:true, sort: sortOption})
    }

    static async getAllProducts(){
        return await productosModelo.find().lean()
    }

    static async addProduct(product={}){
        let nuevoProducto = await productosModelo.create(product)
        return nuevoProducto.toJSON()
    }

    static async updateProduct(id, body={}){
        return await productosModelo.findByIdAndUpdate(id, body, {new:true}).lean()
    }

    static async deleteProduct(id){
        return await productosModelo.findByIdAndDelete(id).lean()
    }
}