const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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

    // Save marathon data to database from the client side
    app.post('/add-marathon', async (req, res) => {
      const marathonData = req.body;
      const result = await marathonCollection.insertOne(marathonData);
      console.log(result);
      res.status(201).send({ ...result, message: "Marathon data added to db successfully!" });
    })


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