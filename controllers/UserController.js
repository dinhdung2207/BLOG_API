const User = require('../models/User')
const bcrypt = require('bcrypt');
const Post = require('../models/Post');
const Category = require('../models/Category')
const upload = require('../middlewares/UploadMiddleware');
const client = global.client

class UserController {
    // [PUT]
    async update(req, res) {
        if (req.userId === req.params.id || req.body.isAdmin) {
            if (req.body.password) {
                try {
                    const salt = await bcrypt.genSalt(10);
                    req.body.password = await bcrypt.hash(req.body.password, salt);
                } catch (err) {
                    return res.status(500).json(err);
                }
            }
            try {
                const user = await User.findByIdAndUpdate(req.params.id, {
                    $set: req.body,
                });
                res.status(200).json("Account has been updated");
            } catch (err) {
                return res.status(500).json(err);
            }
        } else {
            return res.status(403).json("You can update only your account!");
        }
    }

    // [GET]
    async getUser(req, res) {
        try {
            const searchTerm = req.params.id
            client.get(searchTerm, async (err, other) => {
                if (err) throw err

                if (other) {
                    res.status(200).send({
                        other: JSON.parse(other),
                        message: "data retrieved from the cache"
                    })
                } else {
                    const user = await User.findOne({ id: req.params.id });
                    const { password, updatedAt, ...other } = user._doc;
                    client.setex(searchTerm, 600, JSON.stringify(other))
                    res.status(200).send({
                        other: other,
                        message: "cache miss"
                    })
                }
            })
        } catch (err) {
            res.status(500).json({ message: error.message });
        }
    }

    // [PUT]
    async followUser(req, res) {
        if (req.userId !== req.params.id) {
            try {
                const user = await User.findById(req.params.id)
                const currentUser = await User.findById(req.userId)
                if (!user.followers.includes(currentUser.username)) {
                    await user.updateOne({ $push: { followers: currentUser.username } })
                    await currentUser.updateOne({ $push: { followings: user.username } })
                    res.stauts(200).json("This user has been followed")
                } else {
                    res.status(403).json("You already follow this user")
                }
            } catch (error) {
                res.status(500).json(error)
            }
        } else {
            res.status(403).json("You can't follow yourself")
        }
    }

    // [PUT]
    async unfollowUser(req, res) {
        if (req.userId !== req.params.id) {
            try {
                const user = await User.findById(req.params.id)
                const currentUser = await User.findById(req.userId)
                if (user.followers.includes(currentUser.username)) {
                    await user.updateOne({ $pull: { followers: currentUser.username } })
                    await currentUser.updateOne({ $pull: { followings: user.username } })
                    res.status(200).json("You just unfollow this user")
                } else {
                    res.status(403).json("You already followers this user")
                }
            } catch (error) {
                res.status(500).json(error)
            }
        } else {
            res.status(403).json("You can't unfollow yourself")
        }
    }

    // [GET]
    async getUserPosts(req, res, next) {
        const searchTerm = req.params.id + "-posts"
        try {
            client.get(searchTerm, async (err, posts) => {
                if (err) throw err

                if (posts) {
                    res.status(200).send({
                        posts: JSON.parse(posts),
                        message: "data retrieved from the cache"
                    })
                } else {
                    const user = await User.findById(req.params.id).populate('posts')
                    client.setex(searchTerm, 600, JSON.stringify(user.posts))
                }
            })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    }

    // [POST]
    async createUserPost(req, res) {
        const user = await User.findById(req.params.id)
        const post = new Post({
            title: req.body.title
        });
        post.owner = user
        await post.save((err, post) => {
            if (err) {
                res.status(500).send({
                    status: "failure",
                    message: err
                });
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
                                res.status(500).send({
                                    message: err
                                });
                                return;
                            }
                            res.status(200).send({
                                status: "success",
                                message: "Post was created successfully!",
                                data: post
                            });
                        });
                    }
                );
            } else {
                post.save(err => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }
                    res.status(200).send({
                        status: "success",
                        message: "Post was created successfully!",
                        data: post
                    });
                });
            }
        });
        user.posts.push(post._id)
        await user.save()

    }

    async secret(req, res, next) {
        return res.status(200).json({ resources: true })
    }


    // [POST]
    async uploadImage(req, res, next) {
        if (req.userId === req.params.id || req.body.isAdmin) {
            try {
                const user = await User.findById(req.params.id)
                await user.updateOne(req.params.id, {
                    $set: req.file.path,
                });
                res.status(200).json("Upload profile picture successfully");
            } catch (err) {
                return res.status(500).json(err);
            }
        } else {
            return res.status(403).json("Login to upload image");
        }
    }
}

module.exports = new UserController