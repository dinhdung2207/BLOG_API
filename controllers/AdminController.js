const User = require('../models/User')
const Role = require('../models/Role')

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

    // [PUT]
    async assignRole(req, res) {
        try {
            const addRole = await Role.findOne({ name: req.body.roles })
            const currentUser = await User.findById(req.params.id).populate('roles')    
            const listRolesOfUser = []
            for (let index = 0; index < currentUser.roles.length; index++) {
                listRolesOfUser.push(currentUser.roles[index].name)
            }
            if (!listRolesOfUser.includes(req.body.roles) && addRole) {
                currentUser.roles.push(addRole)
                await currentUser.save()
                res.status(200).json("Assign Role successfully")
            } else {
                res.status(500).json("Role is existed on this user")
            }
           
        } catch (error) {
            res.status(500).json(error)
        }
    }

    // [PUT]
    async removeRole(req, res) {
        try {
            const removedRole = await Role.findOne({ name: req.body.roles})
            const currentUser = await User.findById(req.params.id).populate('roles')
            const listRolesOfUser = []
            for (let index = 0; index < currentUser.roles.length; index++) {
                listRolesOfUser.push(currentUser.roles[index].name)
            }
            if(listRolesOfUser.includes(req.body.roles) && removedRole) {
                currentUser.roles.pull(removedRole)
                await currentUser.save()
                res.status(200).json(`Delete role : ${req.body.roles} successfully`)
            } else {
                res.status(500).json(`Role ${req.body.roles} isn't exist on this user`)
            }
        } catch (error) {
            res.status(500).json(error)
        }
    }
}

module.exports = new AdminController