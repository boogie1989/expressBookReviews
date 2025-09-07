class BooksStorage {
  #data = {
    1: { author: "Chinua Achebe", title: "Things Fall Apart", reviews: {} },
    2: {
      author: "Hans Christian Andersen",
      title: "Fairy tales",
      reviews: {},
    },
    3: { author: "Dante Alighieri", title: "The Divine Comedy", reviews: {} },
    4: { author: "Unknown", title: "The Epic Of Gilgamesh", reviews: {} },
    5: { author: "Unknown", title: "The Book Of Job", reviews: {} },
    6: {
      author: "Unknown",
      title: "One Thousand and One Nights",
      reviews: {},
    },
    7: { author: "Unknown", title: "Nj\u00e1l's Saga", reviews: {} },
    8: { author: "Jane Austen", title: "Pride and Prejudice", reviews: {} },
    9: {
      author: "Honor\u00e9 de Balzac",
      title: "Le P\u00e8re Goriot",
      reviews: {},
    },
    10: {
      author: "Samuel Beckett",
      title: "Molloy, Malone Dies, The Unnamable, the trilogy",
      reviews: {},
    },
  };

  async loadAll() {
    return new Promise((resolve) => resolve(Object.values(this.#data)));
  }

  async findByISBN(isbn) {
    return new Promise((resolve) => resolve(this.#data[isbn]));
  }

  async searchInBooks(query, fieldGetter, excludeFields) {
    return new Promise((resolve) => {
      const words = (query.match(/\w+/g) || []).map((w) =>
        w.toLocaleLowerCase()
      );
      const books = [];
      for (const [isbn, book] of Object.entries(this.#data)) {
        const isMatch = words.every((word) =>
          fieldGetter(book).toLocaleLowerCase().includes(word)
        );
        if (isMatch) {
          const result = { isbn, ...book };
          if (excludeFields) {
            for (const field of excludeFields) {
              delete result[field];
            }
          }

          books.push(result);
        }
      }
      resolve(books);
    });
  }
  // resolve(
  //   // Object.values(this.#data).filter(book => {
  //   //       const words = (query.match(/\w+/g) || []).map(w => w.toLocaleLowerCase());
  //   //       return words.every(word => fieldGetter(book).toLocaleLowerCase().includes(word));
  //   // }))
  //   Object.entries(this.#data).filter((book) => {
  //     const words = (query.match(/\w+/g) || []).map((w) =>
  //       w.toLocaleLowerCase()
  //     );
  //     return false;
  //   })
  // )
  //     );
  //   }

  async bookExist(isbn) {
    return new Promise((resolve) => resolve(!!this.#data[isbn]));
  }

  async updateReview(username, isbn, review) {
    return new Promise((resolve) => {
      if (review) {
        this.#data[isbn].reviews[username] = review;
      } else {
        delete this.#data[isbn].reviews[username];
      }

      resolve();
    });
  }
}

module.exports = {
  booksStorage: new BooksStorage(),
};
