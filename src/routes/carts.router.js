import { Router } from "express";
import { carritoManager } from "../dao/carritoManager.js";
import { productosManager } from "../dao/productosManager.js"

export const router = Router()

let cartsPath = "./src/data/carrito.json"
let productPath="./src/data/productos.json"

carritoManager.setPath(cartsPath)
productosManager.setPath(productPath)

router.get('/:cid', async (req, res) => {
    try {
        let { cid } = req.params
        cid = Number(cid)
        if (isNaN(cid)) {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json({ error: `Error - El ID del carrito debe ser numérico` })
        }

        let carritos = await carritoManager.getCarts()

        //Aplicamos un filtro para encontrar el carrito deseado:
        let carrito = carritos.find(cart => cart.cid === cid)
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

    cid = Number(cid)
    if (isNaN(cid)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - El ID del carrito debe ser numérico` })
    }

    pid = Number(pid)
    if (isNaN(pid)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({ error: `Error - El ID del carrito debe ser numérico` })
    }

    //Buscamos si existe el producto y si existe el carrito:
    try {

        let carritos = await carritoManager.getCarts()

        //Aplicamos un filtro para encontrar el carrito:
        let carrito = carritos.find(cart => cart.cid === cid)
        if (!carrito) {
            res.setHeader("Content-Type", "application/json")
            return res.status(404).json({ error: `Error - El carrito con ID=${cid} no existe` })
        }

        let productos = await productosManager.getProducts()

        //Aplicamos un filtro para encontrar el producto:
        let producto = productos.find(product => product.pid === pid)
        if (!producto) {
            res.setHeader("Content-Type", "application/json")
            return res.status(404).json({ error: `Error - El producto con ID=${pid} no existe` })
        }

        let existe = carrito.products.find(prod => prod.pid === pid);
        if (existe) {
            existe.quantity += 1;
        } else {
            carrito.products.push({ pid: pid, quantity: 1 });
        }

        await carritoManager.putCart(carrito)

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