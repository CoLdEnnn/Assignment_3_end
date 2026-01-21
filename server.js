require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.json()); 

const blogSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Title is required'] },
    body: { type: String, required: [true, 'Body is required'] },
    author: { type: String, default: 'Anonymous' }
}, { timestamps: true }); 

const Blog = mongoose.model('Blog', blogSchema);

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to MongoDB Atlas...'))
    .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/blogs', async (req, res) => {
    try {
        const newBlog = new Blog(req.body);
        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/blogs/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });
        res.status(200).json(blog);
    } catch (error) {
        res.status(400).json({ message: "Invalid ID format" });
    }
});

app.put('/blogs/:id', async (req, res) => {
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!updatedBlog) return res.status(404).json({ message: "Blog not found" });
        res.status(200).json(updatedBlog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/blogs/:id', async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if (!deletedBlog) return res.status(404).json({ message: "Blog not found" });
        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: "Invalid ID format" });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));