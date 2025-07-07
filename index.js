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


app.get('/', (req, res) => {
    res.send('Assignment 11 marathon management system server');
})

app.listen(port, () => {
    console.log(`Marathon management server running on port ${port}`);
})