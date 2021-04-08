const Products = require('./Backend/src/model/product.model');
const mongoose = require('mongoose');
const { mongoDB} = require("./Backend/config/config");
const express = require('express');
const bodyParser = require('body-parser');
const getProductDetails = require('./Backend/src/routes/getProductDetails');
const postProduct = require("./Backend/src/routes/postProduct");
const app = express();
const redis = require("redis");

const redisPort = 6379;
const client = redis.createClient({
    host: 'redis-non-cluster.iywc22.0001.usw2.cache.amazonaws.com',
    port: 6379
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

app.get('/product/:product_id', (req, res) => {

    getProductDetails(req.params.product_id)
    .then(result => {

        res.status(200).send(result);
    })
    .catch(err => {
        res.status(500).send(err);
    })
});

app.get('/products/all', (req, res) => {

    const searchTerm = "al";

    try{
    client.get(searchTerm, async (err, result) => {

        if(err) throw err;

        if(result){
            console.log("data retrieved from the cache");
            res.status(200).send({
                result : JSON.parse(result),
                message: "data retrieved from the cache"
            })
        }
        else{
            
            Products.find()
            .then(result => {
                client.setex(searchTerm, 600, JSON.stringify(result));
                console.log("data retrieved from database since cache did not had it");
                res.status(200).send({
                    result: JSON.parse(result),
                    message: "cache miss"
                });
            })
            .catch(err => {
                console.log("ERROR retrieving data from database (since cache did not had it)");
                res.status(500).send(err);
            })
        }
    })
    }
    catch(err) {
        //console.log("try catch block err")
        res.status(500).send({message: "client.get error"});
    }
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