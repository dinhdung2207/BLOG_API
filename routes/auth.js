const router = require("express").Router();
const AuthController = require('../controllers/AuthController')
const VerifySignUp = require("../middlewares/VerifySignUp");

router.post("/signup",
    [
        VerifySignUp.checkDuplicateUsernameOrEmail,
        VerifySignUp.checkRolesExisted
    ], AuthController.siginUp)

router.post("/signin", AuthController.signIn)

module.exports = router;