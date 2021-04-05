const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const port = process.env.PORT || 5055;

app.use(bodyParser.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.swaqi.mongodb.net/${process.env.DB_Name}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const ProductCollection = client.db("freshValley").collection("product");
  const CardCollection = client.db("freshValley").collection("cardProduct");


   app.get('/productItems', (req, res) => {
      ProductCollection.find()
      .toArray((err, product) => {
         res.send(product)
      })
   })

  app.post('/addProducts', (req, res) => {
   const newProduct = req.body;

   ProductCollection.insertOne(newProduct)
   .then(result => {
      console.log('inserted counted',result.insertedCount)
      res.send(result.insertedCount > 0)
   })
  })

   app.post("/addToCart", (req, res) => {
   const {user, pdId} = req.body;
   ProductCollection.find({_id: ObjectId(pdId)})
      .toArray((err, product) => {
         if(product){
            const cartItem = {
               name: product[0].name,
               price:  product[0].price,
               quantity:  1,
               user: user,
            }
            CardCollection.insertOne(cartItem).
            then(result => {
               console.log(result)
               res.send(result.insertedCount > 0)
            })
         }
         console.log(product)
      })
  })

  app.get('/cart/:pdId', (req, res) => {
   ProductCollection.findOne({_id: ObjectId(req.params.pdId)})
   .then(product => {
      console.log(product)
      res.json(product)
   })
})


  app.delete('/delete/:id', (req, res) => {
     ProductCollection.deleteOne({_id: ObjectId(req.params.id)})
     .then(result => {
        res.json(result.deletedCount > 0)
        
     })
  })

});

app.listen(port)