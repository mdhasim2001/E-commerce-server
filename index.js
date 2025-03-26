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
      const ecommerceUserCollection = client.db("ECommerceUser").collection("user")
      const ecommerceProductCollection = client.db("ECommerceProducts").collection("products")
      const userCardProductCollection = client.db("UserProducts").collection("products")
      const userOrderProductCollection = client.db("UserOrderProducts").collection("products")
      const userPurchaseProductCollection = client.db("UserPurchaseProducts").collection("products")

      const bangladeshDivisionCollection = client.db("BangladeshDivision").collection("division")
      const bangladeshDistrictsCollection = client.db("BangladeshDivision").collection("districts")
      const bangladeshUpazilasCollection = client.db("BangladeshDivision").collection("upazilas")


    // start here server api 

    // user callect api 
    app.get('/user?', async(req, res)=>{
      res.send(await ecommerceUserCollection.findOne({email: req.query?.email}))
    })

    app.post('/users', async(req, res)=>{
      const user = req.body.userAddress
      const userDetails = {
        email: user.user,
        address : {
          name : user.name,
          number : user.number,
          region : user.region,
          city : user.city,
          zone : user.zone,
          home : user.address
        }
      }
      await ecommerceUserCollection.insertOne(userDetails)

      res.send({success : true})
    })


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
      const productId = {_id: (userData.product._id)}
      const options = {upsert : true}
      const cardProduct = {$set:{
            user : userData.user,
            product : userData.product
      }}
      await userCardProductCollection.updateOne(productId, cardProduct, options)

      res.send({success : true})
    })

    app.get('/card-product?', async(req, res)=>{
      res.send(await userCardProductCollection.find({user: req.query?.email}).toArray())
    })

    app.delete('/product/:id', async(req,res)=>{
      res.send(await userCardProductCollection.deleteOne({_id: req.params.id}))

    })


    // start here api for order 
    app.put('/orderProducts', async(req,res)=>{
      const orderDetails = req.body
      const productId = {_id : orderDetails.product._id}
      const options = {upsert : true}
      const userOrder = {$set:{
        user : orderDetails.user,
        order : {
          quantity : orderDetails.order.quantity,
          totalPrice : orderDetails.order.totalPrice
        },
        product : orderDetails.product
      }}
      
      await userOrderProductCollection.updateOne(productId, userOrder, options)
      res.send({orderSuccess : true})
    })

    app.get('/orderProducts?', async(req, res)=>{
      res.send(await userOrderProductCollection.find({user: req.query?.email}).toArray())
    })

    app.delete('/orderProducts/:id', async(req, res)=>{
      res.send(await userOrderProductCollection.deleteOne({_id: (req.params.id) }))

    })


    // user confrom order collection api 
    app.post('/confrom-order', async(req, res)=>{
      await userPurchaseProductCollection.insertOne(req.body)
      res.send({success : true})
    })

    app.get('/confrom-order?', async(req, res)=>{
      res.send(await userPurchaseProductCollection.find({user : req.query.email}).toArray())
    })


    // start here division api 
    app.get('/division', async(req, res)=>{
      res.send(await bangladeshDivisionCollection.find().toArray())
    })
    app.get('/districts?', async(req, res)=>{
      // const division = req.query.division;
      res.send(await bangladeshDistrictsCollection.find({division_id: req.query.divisionId}).toArray())
    })
    app.get('/upazilas', async(req, res)=>{
      res.send(await bangladeshUpazilasCollection.find({district_id: req.query.districtsId}).toArray())
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