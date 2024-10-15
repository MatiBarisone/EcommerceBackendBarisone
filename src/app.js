import express from "express"
import { router as routerProducts} from "./routes/products.router.js"
import { router as routerCarts} from "./routes/carts.router.js"


const PORT = 8080
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use("/api/products", routerProducts)
app.use("/api/carts", routerCarts)

app.get("/", (req, res) =>{
    res.setHeader("Content-Type","text/plain");
    res.status(200).send("Bienvenido a la tienda!")
})

const server=app.listen(PORT, ()=>{
    console.log(`Server Online en puerto ${PORT}`)
})
