const express = require('express');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();

// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next){
    const authHeader= req.headers.authorization;
    if (!authHeader){
        return res.status(401).send({message: 'unauthorized Access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err, decoded)=>{
        if(err){
            return res.status(403).send({message: 'Forbidden Access'});
        }
        console.log('decoded', decoded);
        req.decoded= decoded;
        next();
    })
    console.log('Inside verifyJwt',authHeader);
    
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.10zxl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('geniusCar').collection('service');
        const orderCollection= client.db('geniusCar').collection('order');

        // services api
        app.post('/login', async(req, res)=>{
            const user= req.body;
            const accessToken= jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
                expiresIn: '1d'
            });
            res.send(accessToken);
        })

        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/service/:id', async(req, res)=>{
            const id= req.params.id;
            const query= {_id: ObjectId(id)}
            const service= await serviceCollection.findOne(query);
            res.send(service);
        });

        // Post

    app.post('/service', async(req, res)=>{
        const newService= req.body;
        const result = await serviceCollection.insertOne(newService)
        res.send(result);
    });

    // delete

    app.delete('/service/:id', async(req, res)=>{
        const id= req.params.id;
        const query= {_id: ObjectId(id)}
        const result= await serviceCollection.deleteOne(query);
        res.send(result);


    });




    // Order Collection ApI

    app.get('/order', verifyJWT, async(req, res)=>{
        const decodedEmail= req.decoded.email
        const email= req.query.email;
        if(email===decodedEmail){
            const query= {email:email};
        const cursor= orderCollection.find(query);
        const orders= await cursor.toArray();
        res.send(orders)
        }else{
            res.status(403).send({message: 'forbidden access'})
        }
    })



    app.post('/order', async(req, res)=>{
        const newOrder= req.body;
        const result= await orderCollection.insertOne(newOrder);
        res.send(result)
    })

    }
    finally {

    }
}

run().catch(console.dir)

app.get('/hero', (req, res)=>{
    res.send('Hero Makes Heroku')
})

app.get('/', (req, res) => {
    res.send('Genius Server is Running');
});


app.listen(port, () => {
    console.log('listening to port', port);
})

