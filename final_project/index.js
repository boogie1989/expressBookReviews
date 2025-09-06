const express = require('express');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const { UnauthorizedError } = require('./utils/errors.js');
const errorHandler = require('./utils/error_handler.js');
const PORT = 5001;

module.exports.app = express()
    .use(express.json())
    .use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }))
    .use("/customer/auth/*", errorHandler(
        (req, res, next) => {
            const bearerPrefix = 'Bearer ';
            const bearer = req.headers.authorization;
            if (!bearer || !bearer.startsWith(bearerPrefix)) {
                throw new UnauthorizedError();
            }
            const token = bearer.slice(bearerPrefix.length);
            if (token != req.session.user.token) {
                throw new UnauthorizedError();
            }

            next();
        }
    ))
    .use("/customer", customer_routes)
    .use("/", genl_routes)
    .listen(PORT, () => console.log(`Server running on port ${PORT}`));
