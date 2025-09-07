const express = require("express");
const { errorHandler } = require("../utils/error_handler.js");
const { BadRequestError } = require("../utils/errors.js");
const { comparePassword } = require("../utils/password.js");
const { createToken } = require("../utils/token.js");

const { booksStorage } = require("./booksdb.js");
const usersStorage = {};

const customerRouter = express
  .Router()

  //only registered users can login
  .post(
    "/login",
    errorHandler(async (req, res) => {
      const { username, password } = req.body;
      if (!username || !password) {
        throw new BadRequestError("Username and password required");
      }
      const user = usersStorage[username];
      if (!user) {
        throw new BadRequestError("Invalid username or password");
      }

      const valid = await comparePassword(password, user.password);
      if (!valid) {
        throw new BadRequestError("Invalid username or password");
      }

      const token = createToken({ username });

      await new Promise((resolve, reject) => {
        req.session.regenerate((error) => {
          if (error) return reject(error);
          req.session.user = { token, username };

          req.session.save((error) => {
            if (error) return reject(error);
            req.session.user = { token, username };
            res.cookie("token", token);

            resolve();
          });
        });
      });

      return res.send("Customer successfully logged in").end();
    })
  )

  // Add a book review
  .put(
    "/auth/review/:isbn",
    errorHandler(async (req, res) => {
      if ((await booksStorage.bookExist(req.params.isbn)) == false) {
        throw new NotFoundError("Book not found");
      }
      if (!req.query.review) {
        throw new BadRequestError("Review required");
      }

      await booksStorage.updateReview(
        req.session.user.username,
        req.params.isbn,
        req.query.review
      );

      return res
        .send(
          `Then review for the book with ISBN ${req.params.isbn} has been added/updated.`
        )
        .end();
    })
  )

  // Delete a book review
  .delete(
    "/auth/review/:isbn",
    errorHandler(async (req, res) => {
      if ((await booksStorage.bookExist(req.params.isbn)) == false) {
        throw new NotFoundError("Book not found");
      }

      await booksStorage.updateReview(
        req.session.user.username,
        req.params.isbn,
        null
      );

      return res
        .send(
          `Reviews for the ISBN ${req.params.isbn} posted by the user ${req.session.user.username} deleted.`
        )
        .end();
    })
  );

module.exports = {
  customerRouter,
  usersStorage,
};
