const Comment = require('../models/Comment')
const Post = require('../models/Post')

class CommentController {
    // [GET]
    async create(req, res) {
        if (req.userId) {
            const currentPost = await Post.findOne({ slug: req.params.slug })
            console.log(req.params.slug)
            const newCommnet = new Comment(req.body)
            newCommnet.post = currentPost
            currentPost.comments.push(newCommnet._id)
            await currentPost.save()
            try {
                const saveComment = await newCommnet.save()
                res.status(200).json(saveComment)
            } catch (error) {
                res.status(500).json(error)
            }
        } else {
            return res.status(500).json("You must login to comment this post")
        }
    }

    // [DELETE]
    async delete(req, res) {
        if (req.userId) {
            try {
                const deleteComment = Comment.findById(req.params.id)
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
}

module.exports = new CommentController