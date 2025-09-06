const express = require('express');
let booksStorage = require("./booksdb.js");
let usersStorage = require("./auth_users.js").usersStorage;
const { BadRequestError, AlreadyExistsError, NotFoundError } = require('../utils/errors.js');
const errorHandler = require('../utils/error_handler.js');
const { hashPassword } = require('../utils/password.js');


async function searchInBooks(res, query, fieldGetter) {
  const books = await booksStorage.searchInBooks(query, fieldGetter);
  if (books.length === 0) {
    throw new NotFoundError('Book not found');
  }

  return res.status(200).json({ data: books });
}

async function findByIBSN(req, res, resWrapper) {
  const book = await booksStorage.findByISBN(req.params.isbn);
  if (!book) {
    throw new NotFoundError('Book not found');
  }

  return res.status(200).json({ data: resWrapper(book) });
}

async function register(req, res) {
  const { username, password } = req.body;
  if (username && password) {
    if (usersStorage[username]) {
      throw new AlreadyExistsError('User already exists');
    }

    usersStorage[username] = { password: await hashPassword(password), username };
    return res.status(200).json({ message: "User registered successfully" });
  }

  throw new BadRequestError();
}


module.exports.general = express.Router()
  .post("/register", errorHandler(register))

  // Get the book list available in the shop
  .get('/', errorHandler(
    async (req, res) => {
      return res.status(300).json({ data: await booksStorage.loadAll() });
    }
  ))

  // Get book details based on ISBN
  .get('/isbn/:isbn', errorHandler(
    (req, res) => findByIBSN(req, res, book => book)
  ))

  // Get book details based on author
  .get('/author/:author', errorHandler(
    (req, res) => searchInBooks(res, req.params.author, book => book.author)
  ))


  .get('/title/:title', errorHandler(
    (req, res) => searchInBooks(res, req.params.title, book => book.title)
  ))

  //  Get book review
  .get('/review/:isbn', errorHandler(
    (req, res) => findByIBSN(req, res, book => book.reviews)
  ));
