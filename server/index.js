const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'movie_list',
  password: 'F4rkabul3!',
  port: 5432,
});

app.get('/', (req, res) => {
  res.send('Movie API');
});

app.get('/movies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.post('/movies', async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const result = await pool.query(
      'INSERT INTO movies (title) VALUES ($1) RETURNING *',
      [title]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/movies/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM movies WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/movies/:id/toggle', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE movies
       SET watched = NOT watched
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});