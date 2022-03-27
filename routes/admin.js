const router = require('express').Router()
const AuthJwt = require("../middlewares/AuthJwt");
const AdminController = require("../controllers/AdminController")

// assignRole for user
router.put('/users/:id/assignRole', [AuthJwt.verifyToken], AuthJwt.isAdmin, AdminController.assignRole)

// delete Role for user
router.put('/users/:id/removeRole', [AuthJwt.verifyToken, AuthJwt.isAdmin], AdminController.removeRole)

module.exports = router 