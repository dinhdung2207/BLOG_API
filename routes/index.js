const userRoute = require("./users")
const authRoute = require("./auth")
const postRoute = require("./posts")
const postsCMSRoute = require("./cms/postsCMS")
const categoriesCMSRoute = require("./cms/categoriesCMS")
const categoriesUserRoute = require("./categoriesUser")
const commentRoute = require("./comments")
const passportConfig = require('../middlewares/PassPortMiddleware')
const passport = require('passport')

function route(app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    })
    app.use("/api/auth", authRoute)
    app.use("/api/users", userRoute)
    app.use("/api/posts", postRoute, commentRoute)
    app.use("/api/categories", categoriesUserRoute)
    app.use("/api/moderator/categories", categoriesCMSRoute)
    app.use("/api/moderator/posts", postsCMSRoute)
}

module.exports = route