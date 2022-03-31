const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },

    likes: {
        type: Array,
        default: [],
    },

    relies: {
        type: Array,
        default: [],
    }

}, { timestamps: true })

module.exports = mongoose.model('Comment', CommentSchema)