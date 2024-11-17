import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productoSchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        code: {
            type: String,
            unique: true
        },
        price: Number,
        status: Boolean,
        stock: {
            type: Number,
            default: 0
        },
        category: String,
        thumbnails: Array
    },
    {
        timestamps: true
    }
)

productoSchema.plugin(mongoosePaginate);

export const productosModelo = mongoose.model(
    "productos",
    productoSchema
)