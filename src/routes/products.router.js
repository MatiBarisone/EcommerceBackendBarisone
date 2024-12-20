import { Router } from "express";
import { io } from "../app.js";
//import { productosManager } from "../dao/productosManager.js"
import { productosMongoManager as productosManager } from "../dao/productosMongoManager.js";
import { isValidObjectId } from "mongoose";

export const router = Router()

//let productPath="./src/data/productos.json"
//productosManager.setPath(productPath)

router.get('/', async (req, res) => {
    try {
        let { limit, skip, page} = req.query;

        let { docs : productos, totalPages, prevPage, nextPage, hasPrevPage, hasNextPage}  = await productosManager.getProducts(page)

        //Limit y Skip para los productos que traigo:
        if (!limit) {
            limit = productos.length
        }
        else {
            limit = Number(limit)
            if (isNaN(limit)) {
                return res.send("Error - El limit debe ser numérico")
            }
        }
        if (!skip) {
            skip = 0
        }
        else {
            skip = Number(skip)
            if (isNaN(skip)) {
                return res.send("Error - El skip debe ser numérico")
            }
        }
        productos = productos.slice(skip, limit + skip)

        res.setHeader("Content-Type", "application/json")
        
        let payload = productos
        let prevLink = null
        let nextLink = null

        console.log(page)

        if(hasPrevPage){
            prevLink = `api/products/?page=${prevPage}`
        }
        if(hasNextPage){
            nextLink = `api/products/?page=${nextPage}`
        }

        //Devolver aca todo
        res.status(200).json({ status:200, payload, totalPages, prevPage, nextPage, page, hasPrevPage, hasNextPage, prevLink, nextLink})

    } catch (error) {
        console.log(error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(
            {
                error: `Error - Ha ocurrido un problema inesperado en el servidor, intente más tarde!!`,
                detalle: `${error.message}`
            }
        )
    }
})

router.get('/:pid', async (req, res) => {
    try {
        let { pid } = req.params
        
        if (!isValidObjectId(pid)) {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json({ error: `Error - El ID del producto debe ser un ID de MongoDB` })
        }

        let productos  = await productosManager.getAllProducts()

        //Aplicamos un filtro para encontrar el producto deseado:
        let producto = productos.find(product => product._id == pid)
        if (!producto) {
            res.setHeader("Content-Type", "application/json")
            return res.status(404).json({ error: `Error - El producto con ID=${pid} no existe ` })
        }

        res.setHeader("Content-Type", "application/json")
        res.status(200).json({ producto })

    } catch (error) {
        console.log(error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(
            {
                error: `Error - Ha ocurrido un problema inesperado en el servidor, intente más tarde!!`,
                detalle: `${error.message}`
            }
        )
    }
})

router.post('/', async (req, res) => {
    //Validación de campos obligatorios:
    let {id, title, description, code, price, status=true, stock, category, thumbnails=[]} = req.body
    if (id){
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - No se admite un ID externo, se genera de forma automatica!!` }) 
    }
    if (!title || !description || !code || !price || !category || !status ){
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - El producto tiene que tener Titulo, Descripción, Código, Precio, Stock y Categoría de forma obligatoria. Alguno de estos falta en el Body.` })
    }
    
    
    //Validación del tipo de dato ingresado:
    if (typeof title !== "string"){
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - El Titulo debe ser String` })
    }
    if (typeof description !== "string"){
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - El Descripción debe ser String` })
    }
    if (typeof code !== "string"){
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - El Código debe ser String` })
    }
    price = parseInt(price)
    if (typeof price !== "number"){
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - El Precio debe ser un Número` })
    }
    stock = parseInt(stock)
    if (typeof stock !== "number"){
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - El Stock debe ser un Número` })
    }
    if (typeof category !== "string"){
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - El Categoría debe ser String` })
    }
    
    //Agregar el nuevo producto al archivo validando que no exista:
    try {
        let productos  = await productosManager.getAllProducts()
        
        let existe = productos.find(p=>p.code===code)
        if (existe){
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json({ error: `Error - El producto ${title} ya existe en la Base de Datos!!` })
        }

        let nuevoProducto = await productosManager.addProduct({title, description, code, price, status, stock, category, thumbnails})

        //Emisión del servidor por nuevo producto:
        io.emit("newProduct", nuevoProducto)

        res.setHeader("Content-Type", "application/json")
        res.status(201).json({ nuevoProducto })

    } catch (error) {
        console.log(error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(
            {
                error: `Error - Ha ocurrido un problema inesperado en el servidor, intente más tarde!!`,
                detalle: `${error.message}`
            }
        )
    }
})

router.put('/:pid', async (req, res) => {
    
    //Validación de que no modifique el ID:
    let {id} = req.body
    if (id){
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - No se puede modificar el ID` }) 
    }
    
    try {
        let { pid } = req.params

        if (!isValidObjectId(pid)) {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json({ error: `Error - El ID del producto debe ser  un ID de MongoDB` })
        }
        
        let productos  = await productosManager.getAllProducts()

        let producto = productos.find(product => product._id == pid)
        if (!producto) {
            res.setHeader("Content-Type", "application/json")
            return res.status(404).json({ error: `Error - El producto con ID=${pid} no existe ` })
        }

        let updatedProducto = await productosManager.updateProduct(producto._id,req.body)

        res.setHeader("Content-Type", "application/json")
        res.status(201).json({ updatedProducto })

    } catch (error) {
        console.log(error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(
            {
                error: `Error - Ha ocurrido un problema inesperado en el servidor, intente más tarde!!`,
                detalle: `${error.message}`
            }
        )
    }
})

router.delete('/:pid', async (req, res) => {
    try {
        let { pid } = req.params
        
        if (!isValidObjectId(pid)) {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json({ error: `Error - El ID del producto debe ser un ID de MongoDB` })
        }

        let productos  = await productosManager.getAllProducts()

        //Aplicamos un filtro para encontrar el producto que deseamos eliminar:
        let producto = productos.find(product => product._id == pid)
        if (!producto) {
            res.setHeader("Content-Type", "application/json")
            return res.status(404).json({ error: `Error - El producto con ID=${pid} no existe ` })
        }
        await productosManager.deleteProduct(producto._id)

        //Emisión del servidor para borrar el producto:
        io.emit("deleteProduct", producto)

        res.setHeader("Content-Type", "application/json")
        res.status(200).json(`Se elimino el prodcuto con ID: ${ pid }`)

    } catch (error) {
        console.log(error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(
            {
                error: `Error - Ha ocurrido un problema inesperado en el servidor, intente más tarde!!`,
                detalle: `${error.message}`
            }
        )
    }
})