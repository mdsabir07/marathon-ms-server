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
    const applicationCollection = database.collection('applications');

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
      try {
        const filter = { _id: new ObjectId(id) }
        let marathon = await marathonCollection.findOne(filter);
        if (!marathon) {
          return res.status(404).send({ message: 'Marathon not found!' });
        }

        if (typeof marathon.totalRegistrationCount !== 'number') {
          await marathonCollection.updateOne(filter, {
            $set: {
              totalRegistrationCount: 0
            }
          });
          marathon.totalRegistrationCount = 0;
        }
        res.send(marathon);
      } catch (error) {
        console.error('Error fetching marathon:', error);
        res.status(500).send({ message: 'Server error' });
      }
    })

    // Save marathon data to database from the client side (1st api)
    app.post('/add-marathon', async (req, res) => {
      const marathonData = req.body;
      const result = await marathonCollection.insertOne(marathonData);
      // console.log(result);
      res.status(201).send({ ...result, message: "Marathon data added to db successfully!" });
    });

    // ======================
    // Registration/Application related api's
    app.post('/applications', async (req, res) => {
      const application = req.body;

      try {
        // 1. Insert the application
        const result = await applicationCollection.insertOne(application);

        // 2. Increment registration count on related marathon
        if (application.marathonId) {
          await marathonCollection.updateOne(
            { _id: new ObjectId(application.marathonId) },
            { $inc: { totalRegistrationCount: 1 } }
          );
        }

        res.status(201).send({
          ...result,
          message: "Registration/Application successful and count updated"
        });

      } catch (err) {
        console.error("Error in application POST:", err);
        res.status(500).send({ message: "Server error during registration" });
      }
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