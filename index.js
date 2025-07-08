const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
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
    // Creating database and collection
    const database = client.db('marathon_db');
    const marathonCollection = database.collection('marathons');

    // Get marathon data from server and send to the client side (2nd api)
    app.get('/marathons', async (req, res) => {
      try {
        const { limit } = req.query;
        let query = marathonCollection.find();

        if (limit && limit !== 'all') {
          const parsedLimit = parseInt(limit);
          if (!isNaN(parsedLimit) && parsedLimit > 0) {
            query = query.limit(parsedLimit);
          }
        }
        const marathons = await query.toArray();
        res.send(marathons);
      } catch (error) {
        res.status(500).send({ error: 'Failed to fetch marathons' });
      }
    });

    // Get single marathon by id (3rd api)
    app.get('/marathon/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const result = await marathonCollection.findOne(filter);
      res.send(result);
    })

    // Save marathon data to database from the client side (1st api)
    app.post('/add-marathon', async (req, res) => {
      const marathonData = req.body;
      const result = await marathonCollection.insertOne(marathonData);
      // console.log(result);
      res.status(201).send({ ...result, message: "Marathon data added to db successfully!" });
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Assignment 11 marathon management system server');
})

app.listen(port, () => {
  console.log(`Marathon management server running on port ${port}`);
})