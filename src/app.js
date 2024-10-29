import express from "express"
import { engine } from "express-handlebars"
import { Server } from "socket.io" 
import { router as routerProducts } from "./routes/products.router.js"
import { router as routerCarts } from "./routes/carts.router.js"
import { router as routerViews } from "./routes/views.router.js"

const PORT = 8080
const app = express()

//Express Configuration
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//Static Context Configuration
app.use(express.static("./src/public"))

//Handlebars Configuration
app.engine("handlebars", engine())
app.set("view engine", "handlebars")
app.set("views", "./src/views")

//Websocket Configuration


//Routes API
app.use("/api/products", routerProducts)
app.use("/api/carts", routerCarts)

//Routes Views
app.use("/", routerViews)

//Server HTTP
const server = app.listen(PORT, ()=>{
    console.log(`Server Online en puerto ${PORT}`)
})

//Server Websocket
export const io = new Server(server);

io.on("connection", socket=>{
    console.log(`Se conecto un cliente con ID = ${socket.id}`)
})