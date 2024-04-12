const express = require('express')
const jwt = require('jsonwebtoken')
let books = require('./booksdb.js')
const regd_users = express.Router()

let users = []

const isValid = username => {
  return username.length > 3 && /^[a-zA-Z0-9]+$/.test(username)
}

const authenticatedUser = (username, password) => {
  const user = users.find(
    user => user.username === username && user.password === password,
  )
  return user ? true : false
}

//only registered users can login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Both username and password are required for login.' })
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Incorrect username or password.' })
  }

  const token = jwt.sign({ username: username }, 'secret_key', {
    expiresIn: '1h',
  })

  return res.json({ token: token }).send('You have logged in')
})

// Add or Modify a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.username; // assuming username is stored in the session

  if (!isbn || !review || !username) {
    return res.status(400).json({ message: 'ISBN, review, and username are required.' });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  // Check if the user has already posted a review for this book
  if (book.reviews && book.reviews[username]) {
    // Modify the existing review
    book.reviews[username] = review;
    return res.status(200).json({ message: 'Review modified successfully.' });
  } else {
    // Add a new review for the user
    if (!book.reviews) {
      book.reviews = {}; // Initialize reviews object if it doesn't exist
    }
    book.reviews[username] = review;
    return res.status(201).json({ message: 'Review added successfully.' });
  }
});


module.exports.authenticated = regd_users
module.exports.isValid = isValid
module.exports.users = users
