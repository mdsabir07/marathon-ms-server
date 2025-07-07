const express = require('express');
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 3000;
const app = express();


app.get('/', (req, res) => {
    res.send('Assignment 11 marathon management system server');
})

app.listen(port, () => {
    console.log(`Marathon management server running on port ${port}`);
})