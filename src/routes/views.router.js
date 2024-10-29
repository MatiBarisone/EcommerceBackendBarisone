import { Router } from "express"
export const router = Router()

router.get("/", (req, res) =>{
    res.render("home")    
})

router.get("/products", (req, res) =>{
    res.render("index")
})

router.get("/realtimeproducts", (req, res) =>{
    res.render("realTimeProducts")
})