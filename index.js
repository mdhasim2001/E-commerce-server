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
      const userCardProduct = client.db("UserProducts").collection("products")


    // start here server api 

    // this api start here for all products 
    app.get("/products", async(req, res)=>{
        res.send(await ecommerceProductCollection.find().toArray())
    })

    app.get('/product/:id', async(req,res)=>{
      res.send(await ecommerceProductCollection.findOne({_id: new ObjectId(req.params.id)}))

    })

    // this api start here user choges product and resive for user card
    app.post('/product', async(req, res)=>{
      await userCardProduct.insertOne(req.body)
      res.send({success : true})
    })

    app.get('/card-product/?', async(req, res)=>{
      res.send(await userCardProduct.find({email: req.query.email}).toArray())
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