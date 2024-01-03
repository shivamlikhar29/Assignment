const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Content is required'],
    minLegth:3,
    maxlength: [1000, 'Content must be at most 1000 characters'],

  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minLegth:5,
    maxlength: [1000, 'Content must be at most 1000 characters'],
  },
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
