module.exports = {
    JWT_SECRET: ""+ process.env.JWT_SECRET,
    secret: ""+ process.env.JWT_SECRET,
    jwtExpiration: 86400,         
    jwtRefreshExpiration: 12000, 
    jwtLogoutExpiration: 1,
}