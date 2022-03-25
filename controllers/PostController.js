const Post = require('../models/Post')
const User = require('../models/User')
const Category = require('../models/Category')
const PAGE_SIZE = 2

class PostController {
    // [GET]
    async getAllPostsAndPagination(req, res, next) {
        var page = req.query.page
        if (page) {
            page = parseInt(page)
            if (page < 1) {
                page = 1
            }
            var skip = (page - 1) * PAGE_SIZE
            await Post.find({})
                .skip(skip)
                .limit(PAGE_SIZE)
                .then(data => {
                    res.status(200).json(data)
                })
                .catch(next)
        } else {
            await Post.find({})
                .then(data => {
                    res.status(200).json(data)
                })
                .catch(next)
        }
    }

    // CREATE POST WITH CATEGORY
    async create(req, res) {
        const post = new Post({
            title: req.body.title
        });
        await post.save((err, post) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            if (req.body.categories) {
                Category.find(
                    {
                        title: { $in: req.body.categories }
                    },
                    (err, categories) => {
                        if (err) {
                            res.status(500).send({ message: err });
                            return;
                        }
                        post.categories = categories.map(category => category._id);
                        post.save(err => {
                            if (err) {
                                res.status(500).send({ message: err });
                                return;
                            }
                            res.send({ message: "Post was created successfully!" });
                        });
                    }
                );
            } else {
                Category.findOne({ title: "laptrinh" }, (err, category) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }
                    post.categories = [category._id];
                    post.save(err => {
                        if (err) {
                            res.status(500).send({ message: err });
                            return;
                        }
                        res.send({ message: "Post was created successfully!" });
                    });
                });
            }
        });
    }

    // [PUT]
    async update(req, res) {
        try {
            const post = await Post.findById(req.params.slug)
            if (post.Userid === req.body.userId) {
                await post.updateOne({ $set: req.body })
                res.status(200).json("The post has been updated")
            } else {
                res.status(403).json("You can only update your post")
            }
        } catch (error) {
            return res.status(500).json(error)
        }
    }

    // [DELETE]
    async delete(req, res) {
        try {
            const post = await Post.findById(req.params.slug)
            if (post.Userid === req.body.userId) {
                await post.deleteOne()
                res.status(200).json("THe post has been deleted")
            } else {
                res.status(403).json("You can only delete your post")
            }
        } catch (error) {
            return res.status(500).json(error)
        }
    }

    // [SHOW]
    async show(req, res) {
        try {
            const post = await Post.findOne({ slug: req.params.slug }).populate([
                { path: 'categories', select: 'title' },
                { path: 'comments', select: 'body'},
            ])
            res.status(200).json(post)
        } catch (error) {
            res.status(500).json(error)
        }
    }

    // [PUT]
    async reactPost(req, res) {
        try {
            const post = await Post.findOne({ slug: req.params.slug })
            if (!post.likes.includes(req.userId)) {
                await post.updateOne({ $push: { likes: req.userId } })
                res.status(200).json("The post has been liked")
            } else {
                await post.updateOne({ $pull: { likes: req.userId } })
                res.status(200).json("The post has been disliked")
            }
        } catch (error) {
            return res.status(500).json(error)
        }
    }

    // [GET]
    async getAllComments(req, res) {
        try {
            const comment = await Comment.find().populate('user')
            res.status(200).json(comment)
        } catch (error) {
            res.status(500).json(error)
        }
    }

    // [GET]
    async getRelatedPost(req, res) {
        const currentPost = await Post.findOne({ slug: req.params.slug }).populate('categories')
        const listCategories = currentPost.categories
        const result = []
        for (let index = 0; index < listCategories.length; index++) {
            result.push(await Post.findOne({ categories: listCategories[index].id  }).populate([
                { path: 'categories', select: 'title' },
                { path: 'comments', select: 'body'},
            ]))
        }
        res.json(result)
    }
}

module.exports = new PostController