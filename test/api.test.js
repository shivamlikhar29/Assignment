const request = require('supertest');
const app = require('../server'); // Import your Express app
const mongoose = require('mongoose');

describe('Note API', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  let noteId;

  describe('POST /api/notes', () => {
    it('should create a new note', async () => {
      const newNote = {
        title: 'Test Note',
        content: 'This is a test note.',
      };

      const response = await request(app)
        .post('/api/notes')
        .send(newNote);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(newNote));

      // Save the note ID for further testing
      noteId = response.body._id;
    });

    it('should return 400 for incomplete note data', async () => {
      const incompleteNote = {
        title: 'Incomplete Note',
      };

      const response = await request(app)
        .post('/api/notes')
        .send(incompleteNote);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/notes', () => {
    it('should get all notes', async () => {
      const response = await request(app).get('/api/notes');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.any(Array));
    });

    it('should return 404 for non-existent note by ID', async () => {
      const nonExistentNoteId = 'nonexistentnoteid';

      const response = await request(app).get(`/api/notes/${nonExistentNoteId}`);
      expect(response.status).toBe(404);
    });

    it('should get a single note by ID', async () => {
      const response = await request(app).get(`/api/notes/${noteId}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ _id: noteId }));
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('should update an existing note', async () => {
      const updatedNote = {
        title: 'Updated Test Note',
        content: 'This is an updated test note.',
      };

      const response = await request(app)
        .put(`/api/notes/${noteId}`)
        .send(updatedNote);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining(updatedNote));
    });

    it('should return 404 for updating non-existent note by ID', async () => {
      const nonExistentNoteId = 'nonexistentnoteid';

      const response = await request(app)
        .put(`/api/notes/${nonExistentNoteId}`)
        .send({ title: 'Updated Note' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should delete an existing note', async () => {
      const response = await request(app).delete(`/api/notes/${noteId}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ _id: noteId }));
    });

    it('should return 404 for deleting non-existent note by ID', async () => {
      const nonExistentNoteId = 'nonexistentnoteid';

      const response = await request(app).delete(`/api/notes/${nonExistentNoteId}`);
      expect(response.status).toBe(404);
    });
  });
});
