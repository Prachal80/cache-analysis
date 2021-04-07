// import Products from  './product.model';
const Products = require('../model/product.model');
const getProductDetails = (product_id) => {

    return Products.findById(product_id).then(product => {

        if(!product){

            return new Error({
                message: "Product not found"
            });
        }
        else{
            console.log("product: "+ product);
        }
    })
};

module.export = getProductDetails;
