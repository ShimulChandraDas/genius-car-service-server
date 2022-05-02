const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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


//require('crypto').randomBytes(64).toString('hex')

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(4010).send({ message: 'Unauthorized Access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next()
    })
    //console.log('inside verifyJWT ', authHeader);

}


const uri = `mongodb://${process.env.S3_BUCKET}:${process.env.SECRET_KEY}@cluster0-shard-00-00.fh48o.mongodb.net:27017,cluster0-shard-00-01.fh48o.mongodb.net:27017,cluster0-shard-00-02.fh48o.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-cqsegg-shard-0&authSource=admin&retryWrites=true&w=majority`;
//console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('geniusCar').collection('service');
        console.log('Genius Car Db running');
        const orderCollection = client.db('geniusCar').collection('order');

        //AUTH
        app.post('/login', async (res, req) => {
            const user = req.body
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        //service API
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
        });


        //order collection api
        app.get('/order', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            //console.log(email);
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);
            }
            else {
                res.status(403).send({ message: 'Forbidden Access' })
            }

        })

        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
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