const User = require('../models/User')
const Role = require('../models/Role')
const RefreshToken = require('../models/RefreshToken')
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
                            res.send({
                                status: "success",
                                message: "User was registered successfully!"
                            });
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
        User.findOne({
            username: req.body.username
        })
            .populate("roles", "-__v")
            .exec(async (err, user) => {
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
                    expiresIn: config.jwtExpiration // 24 hours
                });
                var authorities = [];
                for (let i = 0; i < user.roles.length; i++) {
                    authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
                }
                var refreshToken = await RefreshToken.createToken(user);
                console.log(refreshToken)
                res.status(200).send({
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    roles: authorities,
                    accessToken: token,
                    refreshToken: refreshToken,
                });
            });
    }

    async signOut(req, res) {
        let token = req.headers["x-access-token"];
        JWT.sign(token, config.secret, {
            expiresIn: config.jwtLogoutExpiration
        }, async (logout, err) => {
            if (logout) {
                res.send({ msg: 'You have been logout' })
            } else {
                res.send({ msg: err })
            }
        })
    }

    async refreshToken(req, res) {
        const { refreshToken: requestToken } = req.body;
        if (requestToken == null) {
            return res.status(403).json({ message: "Refresh Token is required!" });
        }
        try {
            let refreshToken = await RefreshToken.findOne({ token: requestToken });
            if (!refreshToken) {
                res.status(403).json({ message: "Refresh token is not in database!" });
                return;
            }
            if (RefreshToken.verifyExpiration(refreshToken)) {
                RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();

                res.status(403).json({
                    message: "Refresh token was expired. Please make a new signin request",
                });
                return;
            }
            let newAccessToken = JWT.sign({ id: refreshToken.user._id }, config.secret, {
                expiresIn: config.jwtExpiration,
            });
            return res.status(200).json({
                accessToken: newAccessToken,
                refreshToken: refreshToken.token,
            });
        } catch (err) {
            return res.status(500).send({ message: err });
        }
    }
}

module.exports = new AuthController