const Products = require('./Backend/src/model/product.model');
const mongoose = require('mongoose');
const { mongoDB} = require("./Backend/config/config");
const express = require('express');
const bodyParser = require('body-parser');
const getProductDetails = require('./Backend/src/routes/getProductDetails');
const postProduct = require("./Backend/src/routes/postProduct");
const app = express();
var Memcached = require('memcached');

// Created object for memcached
var memcached = new Memcached();
/* code to connect with your memecahced server */
memcached.connect( 'localhost:11211', function( err, conn ){
    console.log("connected with memccached");
if( err ) {
console.log( conn.server,'error while memcached connection!!');
}
});

mongoose.connect(mongoDB, (err) => {
    if (err) {
        console.log(err);
        console.log(`MongoDB Connection Failed`);
    } else {
        console.log(`MongoDB Connected`);
    }
});

app.use(
    bodyParser.urlencoded({
        extended: true
      })
);

app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,HEAD,OPTIONS,POST,PUT,DELETE"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
    );
    res.setHeader("Cache-Control", "no-cache");
    next();
});

app.get('/', function(res, req){
    res.send("Hello World!");
});

app.get('/product/:_id', (req, res) => {

    getProductDetails(req.params._id)
    .then(result => {

        res.status(200).send(result);
    })
    .catch(err => {
        res.status(500).send(err);
    })
});

app.get('/product/:product_name', (req, res) => {

    getProductDetails(req.params.product_name)
    .then(result => {

        res.status(200).send(result);
    })
    .catch(err => {
        res.status(500).send(err);
    })
});

app.get('/products/all', (req, res) => {

    const searchTerm = 'all';
    // method to get saved data....
    memcached.get(searchTerm, function (err, result) {
        
        if(result != null){
            //console.log("*********** Data from cache found ***********");
            res.status(200).send( JSON.parse( result ));
        }
        else{
            Products.find()
            .then(result1 => {
                console.log("DB Read performed");

                // saving information to user key.
                memcached.set(searchTerm, JSON.stringify(result1), 10000, function (err1) {
                if(err1) throw new err1;
                res.status(200).send(result1);
        
                
            });
             
            })
            .catch(err2 => {
                res.status(500).send(err2);
            })
        }
        });

});

app.post('/add/product', (req, res) => {

    var newProduct = new Products ({
        _id: req.body._id,
        product_name: req.body.product_name,
        price: req.body.price,
        seller: req.body.seller,
        available_qty: req.body.available_qty,
        ratings: req.body.ratings,
        images: req.body.images
    })

    newProduct.save().then(product => {
        console.log("Body", req.body);

        res.status(200).send(product);
    })
});


app.listen(3000, function(res, req){

    console.log("server is running at port 3000");
})