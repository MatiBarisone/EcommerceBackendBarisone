import mongoose from "mongoose";

const carritoSchema = new mongoose.Schema(
    {
        products: {
            type:[
                {
                    pid: {
                        type:mongoose.Schema.Types.ObjectId,
                        ref:"productos"
                    },
                    quantity: Number
                }
            ]
        }
    },
    {
        timestamps: true
    }
)


export const carritoModelo = mongoose.model(
    "carritos",
    carritoSchema
)