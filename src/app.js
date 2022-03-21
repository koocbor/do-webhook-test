const express = require('express');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const url = 'mongodb://root:example@mongo-db:27017';
const client = new MongoClient(url);

const secret = process.env.API_KEY || uuidv4();

const app = express();
app.use(express.json())
const port = process.env.PORT || 3000

async function run() {
    await client.connect();
    const collection = client.db('webhook-test').collection('timeseries');

    app.get('/health', async (req, res) => {
        await client.db().command({ ping: 1 });
        res.send();
    })
    
    app.get('/', async (req, res) => {
        console.log(req.headers);
        const reqSecret = req.header('x-api-key');
        console.log(reqSecret);
        if (reqSecret !== secret) {
            res.sendStatus(401);
            return;
        }

        // sort by descending timestamp
        const query = {};
        const sort = '{ ts: -1 }';
        const limit = 10;
    
        const cursor = await collection.find(query).sort(sort).limit(limit);
        const body = await cursor.toArray();
        res.send(body);
    })
    
    app.post('/', async (req, res) => {
        const reqSecret = req.header('x-api-secret');
        if (reqSecret !== secret) {
            res.sendStatus(401);
        }

        const doc = req.body;
        
        console.log(doc);
    
        await collection.insertOne(doc);
    
        res.sendStatus(200);
    })

    app.listen(port, () => {
        console.log(`webhook listening on port ${port}, api-secret: ${secret}`);
    })
}
run();

