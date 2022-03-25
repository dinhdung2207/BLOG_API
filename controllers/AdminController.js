const Post = require('../models/Post')
const User = require('../models/User')
const Role = require('../models/Role')
const Category = require('../models/Category')

class AdminController {
    // [DELETE]
    async deleteUser(req, res) {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted");
        } catch (err) {
            return res.status(500).json(err);
        }
    }
}

module.exports = new AdminController