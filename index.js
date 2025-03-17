const express = require("express");
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config()
const app = express()
const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json())

// database connection link 
const uri = process.env.URL
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // database collection 
      const ecommerceProductCollection = client.db("ECommerceProducts").collection("products")
      const userCardProductCollection = client.db("UserProducts").collection("products")


    // start here server api 

    // this api start here for all products 
    app.get("/products", async(req, res)=>{
        res.send(await ecommerceProductCollection.find().toArray())
    })

    app.get('/product/:id', async(req,res)=>{
      res.send(await ecommerceProductCollection.findOne({_id: new ObjectId(req.params.id)}))

    })


    // api start here for card 
    app.put('/product', async(req, res)=>{
      const userData = req.body
      const productId = {productId : userData.productId}
      const options = {upsert : true}
      const cardProduct = {$set:{
        productId : userData.productId,
        email: userData.email,
        title : userData.title,
        price : userData.price,
        stock: userData.stock,
        totalPrice : userData.totalPrice,
        thumbnail : userData.thumbnail,
        quantity : userData.quantity,
      }}

      await userCardProductCollection.updateOne(productId, cardProduct, options)

      res.send({success : true})
    })

    app.get('/card-product?', async(req, res)=>{
      res.send(await userCardProductCollection.find({email: req.query?.email}).toArray())
    })

    app.delete('/product/:id', async(req,res)=>{
      res.send(await userCardProductCollection.deleteOne({productId: req.params.id}))

    })


    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res)=>{
    res.send("E-commerce server is ready")
})

app.listen(port, ()=>{
    console.log("e-commerce server is ready", port)
})