const express = require('express')
let books = require('./booksdb.js')
let isValid = require('./auth_users.js').isValid
let users = require('./auth_users.js').users
const public_users = express.Router()
const axios = require('axios')

const booksArr = Object.values(books)

public_users.post('/register', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({
      error: 'Both username and password are required for registration.',
    })
  }
  let existingUser = users.filter(user => user.username === username)
  if (existingUser.length > 0) {
    res.send({ error: 'User already exists' })
  } else {
    users.push({ username: username, password: password })
    res.status(200).json('User added succesfully')
  }
})


// Get the book list available in the shop using async-await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5001/books')
    const books = response.data
    res.status(200).json(books)
  } catch (error) {
    console.error('Error fetching book list:', error)
    res.status(500).json({ message: 'Failed to fetch book list.' })
  }
})


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const { isbn } = req.params
  res.json(books[isbn])
})

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const { author } = req.params
  let booksByAuthor = booksArr.filter(book => book.author === author)
  res.json(booksByAuthor)
})

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const { title } = req.params
  let booksByTitle = booksArr.filter(book => book.title === title)
  res.json(booksByTitle)
})

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params
  let bookReviews = books[isbn].reviews
  res.send(bookReviews)
})

module.exports.general = public_users
