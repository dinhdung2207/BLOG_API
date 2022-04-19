const User = require('../models/User')
const Role = require('../models/Role')

class AdminController {
    // [DELETE]
    async deleteUser(req, res) {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).send({
                status: "success",
                message: "Account has been deleted"
            })
        } catch (err) {
            return res.status(500).send({
                status: "failure",
                message: err
            })
        }
    }

    // [PUT]
    async assignRole(req, res) {
        const addRole = await Role.findOne({ name: req.body.roles })
        if (addRole.name == "admin") {
            res.status(400).send({
                status: "failure",
                message: "You can't assign admin role to another one"
            })
        } else {
            try {
                const currentUser = await User.findById(req.params.id).populate('roles')
                const listRolesOfUser = []
                for (let index = 0; index < currentUser.roles.length; index++) {
                    listRolesOfUser.push(currentUser.roles[index].name)
                }
                if (!listRolesOfUser.includes(req.body.roles) && addRole) {
                    currentUser.roles.push(addRole)
                    await currentUser.save()
                    res.status(200).send({
                        message: "success",
                        roles: currentUser.roles,
                        username: currentUser.username,
                    })
                } else {
                    res.status(400).send({
                        status: "failure",
                        message: "Role is existed on this user"
                    })
                }
            } catch (error) {
                res.status(500).send({
                    status: "failure",
                    message: error
                })
            }
        }
    }

    // [PUT]
    async removeRole(req, res) {
        try {
            const removedRole = await Role.findOne({ name: req.body.roles })
            const currentUser = await User.findById(req.params.id).populate('roles')
            const listRolesOfUser = []
            for (let index = 0; index < currentUser.roles.length; index++) {
                listRolesOfUser.push(currentUser.roles[index].name)
            }
            if (listRolesOfUser.includes(req.body.roles) && removedRole) {
                currentUser.roles.pull(removedRole)
                await currentUser.save()
                res.status(200).send({
                    status: "success",
                    message: `Delete role : ${req.body.roles} successfully`,
                    roles: currentUser.roles,
                    username: currentUser.username,
                })
            } else {
                res.status(400).send({
                    status: "failure",
                    message: `Role ${req.body.roles} isn't exist on this user`,
                })
            }
        } catch (error) {
            res.status(500).send({
                status: "failure",
                message: error
            })
        }
    }
}

module.exports = new AdminController