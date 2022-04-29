const express = require('express');
const cors = require('cors');
require('dotenv').config();
//const { request } = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 7000;




// middleware
app.use(cors());
app.use(express.json());

//geniusUser
//XduLPLfquipwjvQ3  


const uri = `mongodb://${process.env.S3_BUCKET}:${process.env.SECRET_KEY}@cluster0-shard-00-00.fh48o.mongodb.net:27017,cluster0-shard-00-01.fh48o.mongodb.net:27017,cluster0-shard-00-02.fh48o.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-cqsegg-shard-0&authSource=admin&retryWrites=true&w=majority`;
//console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('geniusCar').collection('service');
        console.log('Genius Car Db running');


        app.get('/service', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);

        });

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        //POSt
        app.post('/service', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result)
        })

        //DELETE
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {

    }

}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Running Genius car Service Server');
});

app.listen(port, () => {
    console.log('listening to port', port);
})