const express = require('express')
const cors = require('cors')
const { MongoClient } = require('mongodb')
const ObjectId = require('mongodb').ObjectId
const fileUpload = require('express-fileupload')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

//middle wares
app.use(cors())
app.use(express.json())
app.use(fileUpload())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yaqej.mongodb.net/myFirstDatabase?retryWrites=true&writeConcern=majority`

const imageToBase64 = (img) => {
    if (!img) return
    const image = img;
    const imageData = image.data;
    const encodePic = imageData.toString('base64')
    return Buffer.from(encodePic, 'base64')
}
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log('after');

        const database = client.db('shadin-lab');
        const products = database.collection('products');

        app.get("/products", async (req, res) => {
            const limit = parseInt(req.query?.limit) || 3
            const page = parseInt(req.query?.page) || 1
            const price = req.query?.price?.split(',')
            const sizes = req.query?.size?.split(',')
            const brand = req.query?.brand
            let b = brand ? { $eq: brand } : { $ne: '' }
            let s = sizes[0] === '' ? ['s', 'm', 'l', 'xl'] : sizes
            const query = {
                sizes: { $in: s },
                price: { $gt: parseInt(price[0]), $lt: parseInt(price[1]) },
                Brand: b
            }
            console.log('api hitted');
            const options = {}
            const cursor = products.find(query, options);
            const result = await cursor.toArray()
            const data = result?.slice((page - 1) * limit, (page * limit))
            res.json({ total: result.length, data })
        })

        app.post("/products", async (req, res) => {
            const files = req.files
            const product = req.body
            console.log(files?.image);
            product.image = imageToBase64(files?.image)
            image1 = imageToBase64(files?.image1)
            image2 = imageToBase64(files?.image2)
            image3 = imageToBase64(files?.image3)
            product.moreImage = [image1, image2, image3]
            product.isBase64 = true
            product.price = Number(product.price)
            product.sizes = ["l", "xl"]
            product.Brand = 'Nike'
            console.log(product);
            const result = await products.insertOne(product)
            res.json(result)
        })

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('hello world from shadin lab')
})
app.listen(port, () => {
    console.log('app is running from ', port);
})