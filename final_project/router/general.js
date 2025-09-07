const express = require("express");

const { errorHandler } = require("../utils/error_handler.js");
const { hashPassword } = require("../utils/password.js");
const {
  BadRequestError,
  AlreadyExistsError,
  NotFoundError,
} = require("../utils/errors.js");

const { booksStorage } = require("./booksdb.js");
const { usersStorage } = require("./auth_users.js");

const generalRouter = express
  .Router()
  .post(
    "/register",
    errorHandler(async (req, res) => {
      const { username, password } = req.body;
      if (username && password) {
        if (usersStorage[username]) {
          throw new AlreadyExistsError("User already exists");
        }

        usersStorage[username] = {
          password: await hashPassword(password),
          username,
        };
        return res.json({
          message: "Customer successfully registered. Now you can login",
        });
      }

      throw new BadRequestError();
    })
  )

  // Get the book list available in the shop
  .get(
    "/",
    errorHandler(async (req, res) => res.json(await booksStorage.loadAll()))
  )

  // Get book details based on ISBN
  .get(
    "/isbn/:isbn",
    errorHandler(async (req, res) => {
      const book = await booksStorage.findByISBN(req.params.isbn);
      if (!book) {
        throw new NotFoundError("Book not found");
      }

      res.json(book);
    })
  )

  // Get book details based on author
  .get(
    "/author/:author",
    errorHandler(async (req, res) => {
      const books = await booksStorage.searchInBooks(
        req.params.author,
        (book) => book.author
      );
      if (books.length === 0) {
        throw new NotFoundError("Book not found");
      }

      res.json({
        booksbyauthor: books,
      });
    })
  )

  .get(
    "/title/:title",
    errorHandler(async (req, res) => {
      const books = await booksStorage.searchInBooks(
        req.params.title,
        (book) => book.title
      );
      if (books.length === 0) {
        throw new NotFoundError("Book not found");
      }

      res.json({
        booksbytitle: books,
      });
    })
  )

  //  Get book review
  .get(
    "/review/:isbn",
    errorHandler(async (req, res) => {
      const book = await booksStorage.findByISBN(req.params.isbn);
      if (!book) {
        throw new NotFoundError("Book not found");
      }

      res.json(book.reviews);
    })
  );

module.exports = { generalRouter };
