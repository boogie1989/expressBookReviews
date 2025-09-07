const express = require("express");
const session = require("express-session");
const { customerRouter } = require("./router/auth_users.js");
const { generalRouter } = require("./router/general.js");
const { UnauthorizedError } = require("./utils/errors.js");
const { errorHandler } = require("./utils/error_handler.js");
const PORT = 5000;

module.exports.app = express()
  .use(express.json())
  .use(
    "/customer",
    session({
      secret: "fingerprint_customer",
      resave: true,
      saveUninitialized: true,
    })
  )
  .use(
    "/customer/auth/*",
    errorHandler((req, res, next) => {
      const bearerPrefix = "Bearer ";
      const bearer = req.headers.authorization;
      if (!bearer || !bearer.startsWith(bearerPrefix)) {
        throw new UnauthorizedError();
      }
      const token = bearer.slice(bearerPrefix.length);
      if (token != req.session.user.token) {
        throw new UnauthorizedError();
      }

      next();
    })
  )
  .use("/customer", customerRouter)
  .use("/", generalRouter)
  .listen(PORT, () => console.log(`Server running on port ${PORT}`));
