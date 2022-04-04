const Post = require('../models/Post')
const Category = require('../models/Category')
const PAGE_SIZE = 2
const client = global.client

class CMSController {
    // [GET]
    async getAllPostsAndPagination(req, res, next) {
        var page = req.query.page
        var searchTerm = ''
        if (page) {
            searchTerm = "mod" + "-" + page
            page = parseInt(page)
            if (page < 1) {
                page = 1
            }
            var skip = (page - 1) * PAGE_SIZE
            try {
                client.get(searchTerm, async (err, posts) => {
                    if (err) throw err

                    if (posts) {
                        res.status(200).send({
                            posts: JSON.parse(posts),
                            message: "data retrieved from the cache"
                        })
                    } else {
                        await Post.find({})
                            .skip(skip)
                            .limit(PAGE_SIZE)
                            .then(data => {
                                client.setex(page, 600, JSON.stringify(data))
                                res.status(200).send({
                                    posts: data,
                                    message: "cache miss"
                                })
                            })
                            .catch(next)
                    }
                })
            } catch (error) {
                res.status(500).send({ message: error.message });

            }
        } else {
            searchTerm = "mod-allPost"
            try {
                client.get(searchTerm, async (err, posts) => {
                    if (err) throw err

                    if (posts) {
                        res.status(200).send({
                            posts: JSON.parse(posts),
                            message: "data retrieved from the cache"
                        })
                    } else {
                        await Post.find({})
                            .then(data => {
                                client.setex(searchTerm, 600, JSON.stringify(data))
                                res.status(200).send({
                                    posts: data,
                                    message: "cache miss"
                                })
                            })
                            .catch(next)
                    }
                })
            } catch (error) {
                res.status(500).send({ message: error.message });
            }
        }
    }

    // CREATE POST WITH CATEGORY
    async createPost(req, res) {
        const post = new Post({
            title: req.body.title,
            owner: req.userId
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
            const post = await Post.findOne({ slug: req.params.slug })
                await post.updateOne({ $set: req.body })
                res.status(200).json("The post has been updated")
            
        } catch (error) {
            return res.status(500).json(error)
        }
    }

    // [DELETE]
    async delete(req, res) {
        try {
            const post = await Post.findOne({ slug: req.params.slug })
                await post.deleteOne()
                res.status(200).json("THe post has been deleted")
        } catch (error) {
            return res.status(500).json(error)
        }
    }

    // [SHOW]
    async showPostWithRedis(req, res) {
        const searchTerm = "mod - " + req.params.slug
        try {
            client.get(searchTerm, async (err, post) => {
                if (err) throw err

                if (post) {
                    res.status(200).send({
                        post: JSON.parse(post),
                        message: "data retrieved from the cache"
                    })
                } else {
                    const post = await Post.findOne({ slug: req.params.slug }).populate([
                        { path: 'categories', select: 'title' },
                        { path: 'comments', select: 'body' },
                    ])
                    client.setex(searchTerm, "600", JSON.stringify(post))
                    res.status(200).send({
                        post: post,
                        message: "cache miss"
                    })
                }
            })
        } catch (error) {
            res.status(500).send({ message: error.message });

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
        var relatedPost = "mod-" + req.params.slug + "/relatedPost"
        try {
            client.get(relatedPost, async (err, posts) => {
                if (err) throw err

                if (posts) {
                    res.status(200).send({
                        posts: JSON.parse(posts),
                        message: "data retrieved from the cache"
                    })
                } else {
                    const currentPost = await Post.findOne({ slug: req.params.slug }).populate('categories')
                    const listCategories = currentPost.categories
                    let result = []
                    for (let index = 0; index < listCategories.length; index++) {
                        result.push(await Post.find({ categories: listCategories[index].id }).populate([
                            { path: 'categories', select: 'title' },
                            { path: 'comments', select: 'body' },
                        ]))
                    }
                    client.setex(relatedPost, 600, JSON.stringify(result))
                    res.status(200).send({
                        posts: result,
                        message: "cache miss"
                    })
                }
            })
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    }
}

module.exports = new CMSController