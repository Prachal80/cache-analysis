const Products = require('../model/product.model');

var postProduct = (req) => {
 
    var newProduct = new Products ({
        _id: req.body.id,
        product_name: req.body.product_name,
        price: req.body.price,
        seller: req.body.seller,
        available_qty: req.body.available_qty,
        ratings: req.body.ratings,
        images: req.body.images
    })

    newProduct.save().then(product => {
        console.log("Body", product );

    })
}

module.export = postProduct;
