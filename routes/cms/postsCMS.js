const router = require('express').Router()
const CMSController = require('../../controllers/CMSController')
const AuthJwt = require('../../middlewares/AuthJwt')

// create a post
router.post('/create', [AuthJwt.verifyToken, AuthJwt.isModerator], CMSController.createPost)

// get all posts and pagination
router.get('/',[AuthJwt.verifyToken, AuthJwt.isModerator], CMSController.getAllPostsAndPagination)

// update a post
router.put('/:slug',[AuthJwt.verifyToken, AuthJwt.isModerator] ,CMSController.update)

// delete a post
router.delete('/:slug',[AuthJwt.verifyToken, AuthJwt.isModerator], CMSController.delete)

// get a posts
router.get('/:slug',[AuthJwt.verifyToken, AuthJwt.isModerator], CMSController.showPostWithRedis)

// list all related posts
router.get('/:slug/relatedPost', [AuthJwt.verifyToken, AuthJwt.isModerator], CMSController.getRelatedPost)

module.exports = router 