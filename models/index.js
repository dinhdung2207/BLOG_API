const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const db = {}

db.mongoose = mongoose

db.user = require('./User')
db.role = require('./Role')
db.category = require('./Category')
db.refreshToken = require("../models/RefreshToken");

db.CATEGORIES = ["laptrinh", "tienganh", "tiengnhat"]
db.ROLES = ["user", "admin", "moderator"]

module.exports = db