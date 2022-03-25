module.exports = {
    multipleMongooseToObject: function (mongooseArray) {
        return mongooseArray.map(mongooseArray => mongooseArray.toObject());
    },
    mongooseToObject: function (mongooseArray) {
        return mongooseArray ? mongooseArray.toObject() : mongooseArray
    },
}

