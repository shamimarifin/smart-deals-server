const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
require('dotenv').config()
const port = process.env.PORT || 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const e = require('express');
console.log(process.env)
// Middleware
app.use(cors())
app.use(express.json())

dns.setServers(['8.8.8.8', '8.8.4.4']);
// smartUserDB
// 74i2xM1wFgFlW0UH

const uri = "mongodb+srv://simpleDBuser:74i2xM1wFgFlW0UH@cluster0.cej6qpt.mongodb.net/?appName=Cluster0";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cej6qpt.mongodb.net/?appName=Cluster0`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', async (req, res) => {
    res.send('Simple Crud Running')
})

async function run() {
    try {
        await client.connect();

        const db = client.db('smart_db');
        const productCollection = db.collection('products')
        const bidsCollection = db.collection('bids')
        const userCollection = db.collection('users')
        

        // User  related api 
        app.post('/users', async (req, res) => {
            const newUser = req.body
            const email = req.body.email
            const query = { email: email }
            const existingUser = await userCollection.findOne(query)

            if (existingUser) {
                res.send('User already exist')
            }else {
                const result = await userCollection.insertOne(newUser)
                res.send(result)
            }


        })

        // Product APIs

        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct)

            res.send(result)
        })

        app.get('/products', async (req, res) => {

            console.log(req.query)
            const email = req.query.email
            const query = {}

            if (email) {
                query.email = email
            }


            const cursor = productCollection.find(query);
            const result = await cursor.toArray()

            res.send(result)
        })

        app.get('/latest-products', async(req,res)=> {
            const cursor = productCollection.find().sort({created_at: -1}).limit(6)
            const result = await cursor.toArray()

            res.send(result)
        })

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(query)

            res.send(result)
        })

        app.patch('/products/:id', async (req, res) => {
            const id = req.params.id
            const updateProduct = req.body
            const query = { _id: new ObjectId(id) }
            const update = {
                $set: {
                    name: updateProduct.name,
                    price: updateProduct.price
                }
            }

            const result = await productCollection.updateOne(query, update)

            res.send(result)

        })

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }

            const result = await productCollection.deleteOne(query)

            res.send(result)
        })

        // Bids Related Api
        app.get('/bids', async (req, res) => {

            const email = req.query.email;
            const query = {}

            if (email) {
                query.buyer_email = email
            }

            const cursor = bidsCollection.find(query)
            const result = await cursor.toArray()

            res.send(result)
        })

        app.get('/bids/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await bidsCollection.findOne(query)

            res.send(result)
        })

        app.get('/products/bids/:productId' , async(req, res)=> {
            const productId = req.params.productId
            const query = {product : productId}
            console.log('Product query', query)
            const cursor = bidsCollection.find(query).sort({bid_price: -1})
            const result = await cursor.toArray()

            res.send(result)
        })

        app.post('/bids', async (req, res) => {
            const newBid = req.body
            const cursor = await bidsCollection.insertOne(newBid)

            res.send(cursor)
        })

        app.delete('/bids/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await bidsCollection.deleteOne(query)

            res.send(result)
        })


        await client.db('admin').command({ ping: 1 })
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {

    }
}

run().catch(console.dir)

app.listen(port, () => {
    console.log(`Simple Crud Server is Running ${port}`)
})

