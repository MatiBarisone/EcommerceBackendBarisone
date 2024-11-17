import express from "express"
import { engine } from "express-handlebars"
import { Server } from "socket.io"
import mongoose from 'mongoose'
import cors from 'cors'
import { router as routerProducts } from "./routes/products.router.js"
import { router as routerCarts } from "./routes/carts.router.js"
import { router as routerViews } from "./routes/views.router.js"

const PORT = 8080
const app = express()

app.use(cors());

//Express Configuration
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//Static Context Configuration
app.use(express.static("./src/public"))

//Handlebars Configuration
app.engine("handlebars", engine())
app.set("view engine", "handlebars")
app.set("views", "./src/views")

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

//Mongoose Configuration
const conectarDB = async() =>{
    try {
        await mongoose.connect(
            'mongodb+srv://MatiasBarisone:jPLUxgJO63aF77zI@cluster0matiasbarisone.3585v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0MatiasBarisone',
            {
                dbName: "ecommerceBarisone",
            }
        )
        console.log("Date Base online :)")

    } catch (error) {
        console.log(`Error en la conexión de la Base de Datos: ${error.message}`)
    }
}
conectarDB()