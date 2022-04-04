const Comment = require('../models/Comment')
const Post = require('../models/Post')

class CommentController {
    // [POST]
    async create(req, res) {
        if (req.userId) {
            const socket = global.io
            const currentPost = await Post.findOne({ slug: req.params.slug })
            const newComment = new Comment(req.body)
            newComment.post = currentPost
            newComment.user = req.userId
            currentPost.comments.push(newComment._id)
            await currentPost.save()
            try {
                const saveComment = await newComment.save()
                res.status(200).json(saveComment)
                socket.emit('on-comment', { 
                    message: saveComment.body
                })
            } catch (error) {
                res.status(500).json(error)
            }
        } else {
            return res.status(500).json("You must login to comment this post")
        }
    }

    // [DELETE]
    async delete(req, res) {
        const deleteComment = await Comment.findById(req.params.id)
        if (req.userId == deleteComment.user._id.toString()) {
            try {
                await deleteComment.deleteOne()
                res.status(200).json("Delete comment successfully")
            } catch (error) {
                res.status(500).json(error)
            }
        } else {
            return res.status(500).json("You can only delete your comment")
        }
    }

    // [PUT]
    async reactComment(req, res) {
        if (req.userId) {
            try {
                const currentComment = await Comment.findById(req.params.id)
                if (!currentComment.likes.includes(req.userId)) {
                    await currentComment.updateOne({ $push: { likes: req.userId } })
                    res.status(200).json("The comment has been liked")
                } else {
                    await currentComment.updateOne({ $pull: { likes: req.userId } })
                    res.status(200).json("The comment has been disliked")
                }
            } catch (error) {
                res.status(500).json(error)
            }
        } else {
            return res.status(500).json("You must login to react this post")
        }
    }

    // [POST]
    async replyComment(req, res) {
        if (req.userId) {
            const currentComment = await Comment.findById(req.params.id)
            const nestedComment = new Comment(req.body)
            currentComment.relies.push(nestedComment)
            await currentComment.save()
            try {
                const saveComment = await nestedComment.save()
                res.status(200).json(saveComment)
            } catch (error) {
                res.status(500).json(error)
            }
        } else {
            return res.status(500).json("You must login to comment this post")
        }
    }
}

module.exports = new CommentController