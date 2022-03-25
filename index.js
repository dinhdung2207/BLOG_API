const express = require("express")
const app = express()
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const helmet = require("helmet")
const morgan = require("morgan")
const route = require("./routes")
const cors = require("cors")
const db = require("./models")
const Role = db.role

var corsOptions = {
    origin: "http://localhost:8081"
};
app.use(cors(corsOptions));
app.use(express.static('public'));


dotenv.config()

const port = 3000
const database = require('./config/db')


database.connect()

//middleware
app.use(express.json())
app.use(helmet())
app.use(morgan("common"))

route(app)

app.get("/", (req, res) => {
    res.send("Hello")
})

app.listen(port, () => {
    console.log("Back-end server is running")
})

