const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Note = require('./models/note');
const auth = require('basic-auth');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/notes', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


app.use(bodyParser.json());

// Basic Authentication middleware
const authenticate = (req, res, next) => {
    const user = auth(req);
  
    if (!user || user.name !== 'username' || user.pass !== 'password') {
      res.set('WWW-Authenticate', 'Basic realm="Authorization Required"');
      return res.status(401).send('Unauthorized');
    }
  
    next();
  };

app.use(authenticate)


// Create a note
app.post('/notes', async (req, res) => {
  const { title, content } = req.body;

  try {
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newNote = new Note({ title, content });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all notes
app.get('/notes', async (req, res) => {
    try {
        const notes = await Note.find();
    
        if (notes.length === 0) {
          return res.status(404).json({ error: 'No notes found' });
        }
    
        res.json(notes);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
});

// Get a single note
app.get('/notes/:id', async (req, res) => {
    const noteId = req.params.id;

    try {
      const note = await Note.findById(noteId);
  
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }
  
      res.json(note);
    } catch (error) {
      if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return res.status(400).json({ error: 'Invalid note ID' });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update a note
app.put('/notes/:id', async (req, res) => {
    const noteId = req.params.id;
    const { title, content } = req.body;
  
    try {
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }
  
      const updatedNote = await Note.findByIdAndUpdate(
        noteId,
        { title, content },
        { new: true }
      );
  
      if (!updatedNote) {
        return res.status(404).json({ error: 'Note not found' });
      }
  
      res.json(updatedNote);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return res.status(400).json({ error: 'Invalid note ID' });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a note
app.delete('/notes/:id', async (req, res) => {
    const noteId = req.params.id;

    try {
      const deletedNote = await Note.findByIdAndDelete(noteId);
  
      if (!deletedNote) {
        return res.status(404).json({ error: 'Note not found' });
      }
  
      res.json(deletedNote);
    } catch (error) {
      if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return res.status(400).json({ error: 'Invalid note ID' });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
