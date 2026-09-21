const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
let users = require('./auth_users.js').users;
let isValid = require('./auth_users.js').isValid;
const public_users = express.Router();

const BASE_URL = 'http://localhost:5000';

// ---------- Server routes ----------

// Task 7: register
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: 'User already exists' });
  }
  users.push({ username, password });
  return res.status(200).json({ message: 'User successfully registered. Now you can login' });
});

// Task 2: all books
public_users.get('/', (req, res) => {
  res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 3: by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'ISBN not found' });
  res.status(200).json(book);
});

// Task 4: by author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  const result = Object.entries(books)
    .filter(([, b]) => b.author.toLowerCase() === author)
    .map(([isbn, b]) => ({ isbn, ...b }));
  if (!result.length) return res.status(404).json({ message: 'No books by that author' });
  res.status(200).json({ booksbyauthor: result });
});

// Task 5: by title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  const result = Object.entries(books)
    .filter(([, b]) => b.title.toLowerCase() === title)
    .map(([isbn, b]) => ({ isbn, ...b }));
  if (!result.length) return res.status(404).json({ message: 'No books with that title' });
  res.status(200).json({ booksbytitle: result });
});

// Task 6: reviews for a book
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'ISBN not found' });
  res.status(200).json(book.reviews);
});

// ---------- Task 11: Axios client functions (promises / async-await) ----------

// async/await
const getAllBooks = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/`);
    return data;
  } catch (err) {
    console.error('getAllBooks failed:', err.message);
  }
};

// promise callbacks
const getBookByISBN = (isbn) =>
  axios
    .get(`${BASE_URL}/isbn/${isbn}`)
    .then((res) => res.data)
    .catch((err) => console.error('getBookByISBN failed:', err.message));

const getBooksByAuthor = async (author) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return data;
  } catch (err) {
    console.error('getBooksByAuthor failed:', err.message);
  }
};

const getBooksByTitle = (title) =>
  axios
    .get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
    .then((res) => res.data)
    .catch((err) => console.error('getBooksByTitle failed:', err.message));

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
