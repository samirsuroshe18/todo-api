require('dotenv').config();
const express = require('express');
const colors = require('colors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();

const DB = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABSE_PASS}@cluster0.0qgete4.mongodb.net/tododb?retryWrites=true&w=majority`;

mongoose.connect(DB).then(() => {
    console.log("Database connected successfully");
}).catch(() => {
    console.log("Database connection fail");
});

app.use(morgan('dev'));

app.use(express.json({}));
app.use(express.urlencoded({
    extended: true
}));

app.use('/api/todo/auth', require('./routes/user'));


const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`server is listening on port : ${PORT}`.red.underline.bold));

