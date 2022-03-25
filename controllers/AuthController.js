const User = require('../models/User')
const Role = require('../models/Role')
const bcrypt = require('bcrypt')
const bcryptjs = require('bcryptjs')
const { JWT_SECRET } = require('../config/authen')
const JWT = require('jsonwebtoken')
const config = require("../config/authen");

const encodedToken = (userID) => {
    return JWT.sign({
        iss: 'Dinh Dung',
        sub: userID,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + 3)
    }, JWT_SECRET)
}

class AuthController {

    async siginUp(req, res) {
        /*
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        console.log(hashedPassword)
        */
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
        });
        console.log(req.body.roles)
        await user.save((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            if (req.body.roles) {
                Role.find(
                    {
                        name: { $in: req.body.roles }
                    },
                    (err, roles) => {
                        if (err) {
                            res.status(500).send({ message: err });
                            return;
                        }
                        user.roles = roles.map(role => role._id);
                        user.save(err => {
                            if (err) {
                                res.status(500).send({ message: err });
                                return;
                            }
                            res.send({ message: "User was registered successfully!" });
                        });
                    }
                );
            } else {
                Role.findOne({ name: "user" }, (err, role) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }
                    user.roles = [role._id];
                    user.save(err => {
                        if (err) {
                            res.status(500).send({ message: err });
                            return;
                        }
                        res.send({ message: "User was registered successfully!" });
                    });
                });
            }
        });
    }

    async signIn(req, res) {
        await User.findOne({
            username: req.body.username
        })
            .populate("roles", "-__v")
            .exec((err, user) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                if (!user) {
                    return res.status(404).send({ message: "User Not found." });
                }
                var passwordIsValid = bcryptjs.compareSync(
                    req.body.password,
                    user.password
                );
                if (!passwordIsValid) {
                    return res.status(401).send({
                        accessToken: null,
                        message: "Invalid Password!"
                    });
                }
                var token = JWT.sign({ id: user.id }, config.secret, {
                    expiresIn: 86400 // 24 hours
                });
                var authorities = [];
                for (let i = 0; i < user.roles.length; i++) {
                    authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
                }
                res.status(200).send({
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    roles: authorities,
                    accessToken: token
                });
            });
    }
}

module.exports = new AuthController