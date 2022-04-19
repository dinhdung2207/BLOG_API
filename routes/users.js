const router = require('express').Router()
const UserController = require('../controllers/UserController')
const AdminController = require('../controllers/AdminController')
const passport = require('passport')
const passportConfig = require('../middlewares/PassPortMiddleware')
const AuthJwt = require("../middlewares/AuthJwt");
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const uploadImg = multer({ storage: storage }).single('profilePicture');


//update user
router.put("/:id",[AuthJwt.verifyToken], UserController.update)

// delete user
router.delete("/:id/delete",[AuthJwt.verifyToken, AuthJwt.isAdmin], AdminController.deleteUser)

// get user
router.get('/:id', UserController.getUser)

// follow user
router.put('/:id/follow',[AuthJwt.verifyToken], UserController.followUser)

// unfollow users
router.put('/:id/unfollow',[AuthJwt.verifyToken], UserController.unfollowUser)

// get posts of user
router.get('/:id/posts', UserController.getUserPosts)

// create posts of users
router.post('/:id/create-post',[AuthJwt.verifyToken], UserController.createUserPost)

// upload picture
router.post('/:id/uploadImage', [AuthJwt.verifyToken], uploadImg, UserController.uploadImage)

router.get('/secret', passport.authenticate('jwt', { session: false }), UserController.secret)

module.exports = router