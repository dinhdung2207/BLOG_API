const router = require('express').Router()
const CommentController = require('../controllers/CommentController')
const AuthJwt = require("../middlewares/AuthJwt");

// create new comment
router.post('/:slug/comment/create',[AuthJwt.verifyToken], CommentController.create)

// Delete a new comment
router.delete('/:slug/comment/:id/delete',[AuthJwt.verifyToken] ,CommentController.delete)

// react a comment
router.put('/:slug/comment/:id/like',[AuthJwt.verifyToken], CommentController.reactComment)

// reply a comment
router.post('/:slug/comment/:id/reply',[AuthJwt.verifyToken], CommentController.replyComment)

module.exports = router