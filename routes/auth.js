const router = require("express").Router();
const AuthController = require('../controllers/AuthController')
const VerifySignUp = require("../middlewares/VerifySignUp");
const AuthJwt = require("../middlewares/AuthJwt")
router.post("/signup",
    [
        VerifySignUp.checkDuplicateUsernameOrEmail,
        VerifySignUp.checkRolesExisted
    ], AuthController.siginUp)

router.post("/signin", AuthController.signIn)

router.post("/refreshtoken", AuthController.refreshToken);

router.put("/signout",[AuthJwt.verifyToken], AuthController.signOut)

module.exports = router;