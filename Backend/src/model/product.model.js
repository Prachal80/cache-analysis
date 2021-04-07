const mongoose = require("mongoose")
const productSchema = mongoose.Schema({
    _id: {type: Number},
    product_name: { type: String},
    price:{ type: Number},
    seller:{ type: String},
    available_qty: {type: String},
    ratings: { type: Number},
    images: {type: String}
});

module.exports = mongoose.model('Products', productSchema);;