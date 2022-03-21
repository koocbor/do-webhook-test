const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Use environment var or create a UUID to act as a "key" to prevent
// unauthorized POST / GET requests.
const secret = process.env.API_KEY || uuidv4();

const app = express();
app.use(express.json())
const port = process.env.PORT || 3000

const values = [];


app.get('/health', async (req, res) => {
    res.send();
})

app.get('/', async (req, res) => {
    const reqSecret = req.header('x-api-key');
    if (reqSecret !== secret) {
        res.sendStatus(401);
        return;
    }
    res.send(values);
})

app.post('/', async (req, res) => {
    const reqSecret = req.header('x-api-key');
    if (reqSecret !== secret) {
        res.sendStatus(401);
    }

    const doc = req.body;
    values.unshift(doc);

    if (values.length > 10) {
        values.length = 10;
    }

    res.sendStatus(200);
})

app.listen(port, () => {
    console.log(`webhook listening on port ${port}, api-secret: ${secret}`);
})
