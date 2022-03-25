const mongoose = require('mongoose')
var slug = require('mongoose-slug-generator')

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        max: 500,
    },
    img: {
        type: String,
    },
    likes: {
        type: Array,
        default: [],
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    }],
    slug: {
        type: String,
        slug: "title",
        unique: true,
    },
    file: {
        type: String,
        default: ''
    },
    owner: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true })

mongoose.plugin(slug)
const Post = mongoose.model('Post', PostSchema)

module.exports = Post