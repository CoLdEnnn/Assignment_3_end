require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')

const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.json()); 


const client = new MongoClient(process.env.MONGO_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
let db = null;
async function connectDB() {
  if (!db) {
    try {
      await client.connect();
      db = client.db("blogs");
      console.log("Connected to MongoDB!");
    } catch (error) {
      console.error("Database connection error:", error.message);
      throw error;
    }
  }
  return db;
}

async function getBlogsCollection() {
  const database = await connectDB();
  return database.collection("blog");
}
connectDB().catch(console.error)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/blogs', async (req, res) => {
    try {
        const collection = await getBlogsCollection();
        const { title, body, author } = req.body;

        if (!title || !body) {
            return res.status(400).json({message: "Title and body are required"})
        }

        const newBlog = {
            title,
            body,
            author: author || 'Anonymous',
            createdAt: new Date()
        };

        const result = await collection.insertOne(newBlog);
        res.status(201).json({ _id: result.insertedId, ... newBlog });
    } catch(error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/blogs', async (req, res) => {
    try {
        const collection = await getBlogsCollection();
        const blogs = await collection.find({}).toArray();
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message  });
    }
});

app.get('/blogs/:id', async (req, res) => {
    try {
        const collection = await getBlogsCollection();
        const blog = await collection.findOne({ _id: new ObjectId(req.params.id) });
        
        if (!blog) return res.status(404).json({ message: "Blog not found" });
        res.status(200).json(blog);
    } catch (error) {
        res.status(400).json({ message: "Invalid ID format" });
    }
});

app.put('/blogs/:id', async (req, res) => {
    try {
        const collection = await getBlogsCollection();
        const updatedData = req.body;
        
        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updatedData },
            { returnDocument: 'after' }
        );

        if (!result) return res.status(404).json({ message: "Blog not found" });
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/blogs/:id', async (req, res) => {
    try {
        const collection = await getBlogsCollection();
        const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: "Invalid ID format" });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));