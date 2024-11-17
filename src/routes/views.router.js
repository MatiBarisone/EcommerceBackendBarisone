import { Router } from "express"
import { productosMongoManager as productosManager } from "../dao/productosMongoManager.js"
import { carritoMongoManager as carritoManager } from "../dao/carritoMongoManager.js"
import { isValidObjectId } from "mongoose";
export const router = Router()

router.get("/", (req, res) =>{
    res.render("home")    
})

router.get("/products", async (req, res) =>{
    
    let { page, limit, query, sort} = req.query

    if(page){
        page = Number(page)
        if (isNaN(page)) {
            return res.send("Error - La page debe ser numérico")
        }
    }

    if (limit){
        limit = Number(limit);
        if (isNaN(limit)) {
            return res.send("Error - El limit debe ser numérico")
        }
    }
    
    let { docs : productos, totalPages, prevPage, nextPage, hasPrevPage, hasNextPage}= await productosManager.getProducts(page, limit, query, sort)

    res.render("index", {
        productos,
        totalPages, 
        prevPage, 
        nextPage, 
        hasPrevPage, 
        hasNextPage
    })
})

router.get("/cart/:cid", async (req, res) =>{
    let {cid} = req.params

    if (!isValidObjectId(cid)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - El ID del carrito debe ser un ID de MongoDB` })
    }

    try {
        let carritos = await carritoManager.getCarts()
        let carrito = carritos.find(c => c._id == cid)
        if (!carrito) {
            res.setHeader("Content-Type", "application/json")
            return res.status(404).json({ error: `Error - El carrito con ID=${cid} no existe` })
        }

        res.render("cart", {
            carrito
        })

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

router.get("/product/:pid", async (req, res) =>{
    let {pid} = req.params

    if (!isValidObjectId(pid)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - El ID del producto debe ser un ID de MongoDB` })
    }

    try {
        let productos = await productosManager.getAllProducts()
        let producto = productos.find(product => product._id == pid)

        if (!producto) {
            res.setHeader("Content-Type", "application/json")
            return res.status(404).json({ error: `Error - El producto con ID=${pid} no existe` })
        }

        res.render("product", {
            producto
        })

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

router.get("/realtimeproducts", async (req, res) =>{
    
    let productos = await productosManager.getAllProducts()

    res.render("realTimeProducts", {
        productos
    })

})