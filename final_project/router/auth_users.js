const express = require('express');
let booksStorage = require("./booksdb.js");
const { BadRequestError } = require('../utils/errors.js');
const errorHandler = require('../utils/error_handler.js');
const { comparePassword } = require('../utils/password.js');
const { createToken } = require('../utils/token.js');

const usersStorage = {};

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new BadRequestError('Username and password required');
  }
  const user = usersStorage[username];
  if (!user) {
    throw new BadRequestError('Invalid username or password');
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    throw new BadRequestError('Invalid username or password');
  }

  const token = createToken({ username });

  await new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) return reject(error);
      req.session.user = { token, username };

      req.session.save((error) => {
        if (error) return reject(error);
        resolve();
      });
    });
  });

  return res.status(200).json({ data: req.session.user });
}

async function addReview(req, res) {
  if (await booksStorage.bookExist(req.params.isbn) == false) {
    throw new NotFoundError('Book not found');
  }
  if (!req.body.review) {
    throw new BadRequestError('Review required');
  }

  await booksStorage.updateReview(
    req.session.user.username,
    req.params.isbn,
    req.body.review,
  );

  return res.status(200).json({ message: "Review added successfully" });
}

async function deleteReview(req, res) {
  if (await booksStorage.bookExist(req.params.isbn) == false) {
    throw new NotFoundError('Book not found');
  }

  await booksStorage.updateReview(
    req.session.user.username,
    req.params.isbn,
    null,
  );

  return res.status(200).json({ message: "Review deleted successfully" });
}


module.exports.usersStorage = usersStorage;
module.exports.authenticated = express.Router()

  //only registered users can login
  .post("/login", errorHandler(login))

  // Add a book review
  .put("/auth/review/:isbn", errorHandler(addReview))

  // Delete a book review
  .delete("/auth/review/:isbn", errorHandler(deleteReview));
