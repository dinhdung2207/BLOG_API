const mongoose = require('mongoose');
const db = require("../../models");
const Role = db.role
const Category = db.category

async function initialRole() {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: "user"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'user' to roles collection");
            });
            new Role({
                name: "moderator"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'moderator' to roles collection");
            });
            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'admin' to roles collection");
            });
        }
    });
}

async function initialCategory() {
    Category.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Category({
                title: "laptrinh"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'laptrinh' to roles collection");
            });
            new Category({
                title: "tienganh"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'tienganh' to roles collection");
            });
            new Category({
                title: "tiengnhat"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'tiengnhat' to roles collection");
            });
        }
    });
}
async function connect(){
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/rest-api-blog', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        initialRole()
        initialCategory()
        console.log('Connect successfully')
    } catch (error) {
        console.log('connect failure')
    }
}

module.exports = { 
    connect,
}