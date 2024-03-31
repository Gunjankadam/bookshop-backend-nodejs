const express = require('express');
const mongoose = require('mongoose');
const User = require('./model');
const Book = require('./model');
const Review = require('./model');
const dotenv= require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
connectdB = mongoose.connect(process.env.CONNECTION_STRING)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));


// Add a new book
app.post('/books', async (req, res) => {
    const { isbn, title, author } = req.body;
    try {
        const newBook = new Book({ isbn, title, author });
        await newBook.save();
        res.status(201).json({ message: 'Book added successfully', book: newBook });
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Display all books
app.get('/books', async (req, res) => {
    try {
        const allBooks = await Book.find();
        res.json(allBooks);
    } catch (error) {
        console.error('Error fetching all books:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Search books by isbn
app.get('/books/:isbn', async (req, res) => {
    const { isbn } = req.params;
    try {
        const book = await Book.findOne({ isbn });
        if (book) {
            res.json(book);
        } else {
            res.status(404).json({ error: 'Book not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Search books by author
app.get('/books/author/:author', async (req, res) => {
    const { author } = req.params;
    try {
        const booksByAuthor = await Book.find({ author });
        res.json(booksByAuthor);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Search books by title
app.get('/books/title/:title', async (req, res) => {
    const { title } = req.params;
    try {
        const booksByTitle = await Book.find({ title });
        res.json(booksByTitle);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Register New user
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const token = 'dummy_token';
        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add/Modify a book review
app.post('/books/:isbn/reviews', async (req, res) => {
    const { isbn } = req.params;
    const { userId, reviewText } = req.body;
    try {
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: User not logged in' });
        }
        const book = await Book.findOne({ isbn });
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        const newReview = new Review({ userId, bookId: book._id, reviewText });
        await newReview.save();
        res.status(201).json({ message: 'Review added successfully', review: newReview });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete book
app.delete('/reviews/:reviewId', async (req, res) => {
    const { reviewId } = req.params;
    const { userId } = req.body;
    try {
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: User not logged in' });
        }
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (review.userId.toString() !== userId) {
            return res.status(403).json({ error: 'Forbidden: User cannot delete this review' });
        }
        await review.remove();
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
