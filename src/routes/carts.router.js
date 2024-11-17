import { Router } from "express";
//import { carritoManager } from "../dao/carritoManager.js";
//import { productosManager } from "../dao/productosManager.js"
import { carritoMongoManager as carritoManager } from "../dao/carritoMongoManager.js";
import { productosMongoManager as productosManager } from "../dao/productosMongoManager.js"
import { isValidObjectId } from "mongoose";

export const router = Router()

//let cartsPath = "./src/data/carrito.json"
//let productPath="./src/data/productos.json"
//carritoManager.setPath(cartsPath)
//productosManager.setPath(productPath)

router.get('/:cid', async (req, res) => {
    try {
        let { cid } = req.params
        
        if (!isValidObjectId(cid)) {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json({ error: `Error - El ID del carrito debe ser un ID de MongoDB` })
        }

        let carritos = await carritoManager.getCarts()

        //Aplicamos un filtro para encontrar el carrito deseado:
        let carrito = carritos.find(cart => cart._id == cid)

        if (!carrito) {
            res.setHeader("Content-Type", "application/json")
            return res.status(404).json({ error: `Error - El carrito con ID=${cid} no existe ` })
        }

        let productosCarrito = carrito.products

        res.setHeader("Content-Type", "application/json")
        res.status(200).json({ productosCarrito })

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
    let {id, products=[]} = req.body
    if (id){
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - No se admite un ID externo, se genera de forma automatica!!` }) 
    }
    
    //Agregar el nuevo carrito al archivo: (luego de generarlo se agregaran los productos)
    try {
        let nuevoCarrito = await carritoManager.addCart({products})

        res.setHeader("Content-Type", "application/json")
        res.status(201).json({ nuevoCarrito })

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

router.post('/:cid/product/:pid', async (req, res) => {
    let {cid, pid} = req.params

    if (!isValidObjectId(cid)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - El ID del carrito debe ser un ID de MongoDB` })
    }

    if (!isValidObjectId(pid)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - El ID del producto debe ser un ID de MongoDB` })
    }

    //Buscamos si existe el producto y si existe el carrito:
    try {

        let carritos = await carritoManager.getCarts()

        //Aplicamos un filtro para encontrar el carrito:
        let carrito = carritos.find(cart => cart._id == cid)
        if (!carrito) {
            res.setHeader("Content-Type", "application/json")
            return res.status(404).json({ error: `Error - El carrito con ID=${cid} no existe` })
        }

        let productos  = await productosManager.getAllProducts()

        //Aplicamos un filtro para encontrar el producto:
        let producto = productos.find(product => product._id == pid)
        if (!producto) {
            res.setHeader("Content-Type", "application/json")
            return res.status(404).json({ error: `Error - El producto con ID=${pid} no existe` })
        }

        let productoIndice = carrito.products.findIndex(p => p.pid._id == pid);

        if (productoIndice === -1) {
            carrito.products.push({
                pid: pid,
                quantity: 1 
            })
        } else {
            carrito.products[productoIndice].quantity++
        }

        
        await carritoManager.putInCart(cid, carrito)


        res.setHeader("Content-Type", "application/json")
        res.status(201).json({ "El nuevo carrito es":carrito, "Y se agrego el producto":producto })

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

router.delete('/:cid/product/:pid', async (req, res) => {
    let {cid, pid} = req.params

    if (!isValidObjectId(cid)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - El ID del carrito debe ser un ID de MongoDB` })
    }

    if (!isValidObjectId(pid)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - El ID del producto debe ser un ID de MongoDB` })
    }

    //Buscamos si existe el producto y si existe el carrito:
    try {

        let carritos = await carritoManager.getCarts()

        //Aplicamos un filtro para encontrar el carrito:
        let carrito = carritos.find(cart => cart._id == cid)
        if (!carrito) {
            res.setHeader("Content-Type", "application/json")
            return res.status(404).json({ error: `Error - El carrito con ID=${cid} no existe` })
        }

        let productos  = await productosManager.getAllProducts()

        //Aplicamos un filtro para encontrar el producto:
        let producto = productos.find(product => product._id == pid)
        if (!producto) {
            res.setHeader("Content-Type", "application/json")
            return res.status(404).json({ error: `Error - El producto con ID=${pid} no existe` })
        }

        let productoIndice = carrito.products.findIndex(p => p.pid._id == pid);

        if (productoIndice !== -1) {
            carrito.products.splice(productoIndice, 1)
        } 

        await carritoManager.putInCart(cid, carrito)

        res.setHeader("Content-Type", "application/json")
        res.status(201).json({ "El nuevo carrito es":carrito, "Y se agrego el producto":producto })

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

router.delete('/:cid', async (req, res) => {
    try {
        let { cid } = req.params
        
        if (!isValidObjectId(cid)) {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json({ error: `Error - El ID del carrito debe ser un ID de MongoDB` })
        }

        let carritos = await carritoManager.getCarts()

        //Aplicamos un filtro para encontrar el carrito deseado:
        let carrito = carritos.find(cart => cart._id == cid)
        if (!carrito) {
            res.setHeader("Content-Type", "application/json")
            return res.status(404).json({ error: `Error - El carrito con ID=${cid} no existe ` })
        }

        carrito.products=[]

        await carritoManager.putInCart(cid, carrito)

        res.setHeader("Content-Type", "application/json")
        res.status(200).json({ carrito })

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



router.put('/:cid/product/:pid', async (req, res) => {
    let {cid, pid} = req.params
    let {id, quantity} = req.body

    quantity=Number(quantity)
    if (isNaN(quantity)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - El ID del quantity debe ser un numero` })
    }

    if (id){
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - No se puede modificar el ID` }) 
    }

    if (!isValidObjectId(cid)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - El ID del carrito debe ser un ID de MongoDB` })
    }

    if (!isValidObjectId(pid)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - El ID del producto debe ser un ID de MongoDB` })
    }

    //Buscamos si existe el producto y si existe el carrito:
    try {

        let carritos = await carritoManager.getCarts()

        //Aplicamos un filtro para encontrar el carrito:
        let carrito = carritos.find(cart => cart._id == cid)
        if (!carrito) {
            res.setHeader("Content-Type", "application/json")
            return res.status(404).json({ error: `Error - El carrito con ID=${cid} no existe` })
        }

        let productos = await productosManager.getAllProducts()

        //Aplicamos un filtro para encontrar el producto:
        let producto = productos.find(product => product._id == pid)
        if (!producto) {
            res.setHeader("Content-Type", "application/json")
            return res.status(404).json({ error: `Error - El producto con ID=${pid} no existe` })
        }

        let productoIndice = carrito.products.findIndex(p => p.pid._id == pid);

        if (productoIndice !== -1) {
            carrito.products[productoIndice].quantity= quantity
        } 

        await carritoManager.putInCart(cid, carrito)

        res.setHeader("Content-Type", "application/json")
        res.status(201).json({ "El nuevo carrito es":carrito, "Y se agrego el producto":producto })

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

router.put('/:cid', async (req, res) => {
    try {
        let { cid } = req.params

        if (!isValidObjectId(cid)) {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json({ error: `Error - El ID del carrito debe ser un ID de MongoDB` })
        }

        let carritos = await carritoManager.getCarts()
        //Aplicamos un filtro para encontrar el carrito deseado:
        let carrito = carritos.find(cart => cart._id == cid)
        if (!carrito) {
            res.setHeader("Content-Type", "application/json")
            return res.status(404).json({ error: `Error - El carrito con ID=${cid} no existe ` })
        }

        let newProducts = req.body
        if (!Array.isArray(newProducts)){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`Formato de los datos es inválido`})
        }

        let productos  = await productosManager.getAllProducts()
        let error = false
        newProducts.forEach(p =>{
            let dato = productos.find(prod => prod._id == p.pid)
            if (!dato){
                error = true
            }
        })

        if(error){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`Error con alguno de los productos enviados`})
        }

        for (const p of newProducts) {
            if (!p.quantity) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: `Error con alguno de los productos enviados, el Quantity debe estar!!` });
            }
        }

        newProducts = newProducts.map(p => ({
            pid: p.pid,
            quantity: p.quantity
        }));
        

        carrito.products=newProducts

        await carritoManager.putInCart(cid, carrito)

        res.setHeader("Content-Type", "application/json")
        res.status(200).json({ carrito })

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
