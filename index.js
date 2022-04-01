const express = require("express")
const app = express()
const fetch = require("node-fetch");
const redis = require('redis');
//const { search } = require('../routes/users');
const client = redis.createClient(6379)
client.on('error', (err) => {
    console.log("Error " + err)
});

global.client = client

const http = require('http')
const server = http.createServer(app)
const {Server} = require('socket.io')
const io = new Server(server)
global.io = io
const mongoose = require("mongoose")
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
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
    res.sendFile(__dirname + "/index.html")
})
/*
app.listen(port, () => {
    console.log("Back-end server is running")
})

io.on('connection', function(client) {
    console.log('Client connected')
    client.on('join', function(data) {
        console.log(data)
    })
})
*/

server.listen(port, () => {
    console.log("Back-end server is running")
})
io.on('connection', (socket) => {
    console.log('connected successfully : '+ socket.id)
    socket.on('disconnect', () => {
        console.log('disconnected '+ socket.id)
    })
    socket.on('on-comment', data => {
        io.emit('user-comment', data)
    })
})
