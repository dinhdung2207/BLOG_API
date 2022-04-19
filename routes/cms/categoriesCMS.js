const router = require('express').Router()
const CategoryController = require('../../controllers/CategoryController')
const AuthJwt = require("../../middlewares/AuthJwt");

// Moderator
// List category
router.get('/', [AuthJwt.verifyToken, AuthJwt.isModerator], CategoryController.index)

// Create category 
router.post('/create',[AuthJwt.verifyToken, AuthJwt.isModerator], CategoryController.create)

// Delete category
router.delete('/:id/delete',[AuthJwt.verifyToken, AuthJwt.isModerator], CategoryController.delete)

// update categoru
router.put('/:id/update',[AuthJwt.verifyToken, AuthJwt.isModerator], CategoryController.update)

module.exports = router