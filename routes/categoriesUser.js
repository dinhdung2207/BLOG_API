const router = require('express').Router()
const CategoryController = require('../controllers/CategoryController')

// List category
router.get('/', CategoryController.index)

module.exports = router