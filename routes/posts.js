const router = require('express').Router()
const PostController = require('../controllers/PostController')
const AuthJwt = require("../middlewares/AuthJwt");

// create a post
router.post('/create', PostController.create)

// update a post
router.put('/:slug', PostController.update)

// delete a post
router.delete('/:slug', PostController.delete)

// get a posts
router.get('/:slug', PostController.showPostWithRedis)

// get all posts and pagination
router.get('/', PostController.getAllPostsAndPagination)

// react a post 
router.put('/:slug/like',[AuthJwt.verifyToken], PostController.reactPost)

// list all comment of the post
router.get('/:slug/comment', PostController.getAllComments)

// list all related posts
router.get('/:slug/relatedPost', PostController.getRelatedPost)

module.exports = router 