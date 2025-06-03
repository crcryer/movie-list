import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [query, setQuery] = useState('');
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const applyFilter = (data, activeFilter) => {
    if (activeFilter === 'watched') {
      return data.filter((movie) => movie.watched);
    } else if (activeFilter === 'unwatched') {
      return data.filter((movie) => !movie.watched);
    } else {
      return data;
    }
  };

  const fetchMovies = () => {
    fetch('http://localhost:3001/movies')
      .then((res) => res.json())
      .then((data) => {
        setMovies(data);
        setFilteredMovies(applyFilter(data, filter));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching movies:', err);
        setLoading(false);
      });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    fetch('http://localhost:3001/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    })
      .then((res) => res.json())
      .then(() => {
        setNewTitle('');
        fetchMovies();
      })
      .catch((err) => console.error('Error adding movie:', err));
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:3001/movies/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        if (selectedMovie?.id === id) setSelectedMovie(null);
        fetchMovies();
      })
      .catch((err) => console.error('Error deleting movie:', err));
  };

  const handleToggleWatched = (id) => {
    fetch(`http://localhost:3001/movies/${id}/toggle`, {
      method: 'PATCH',
    })
      .then(() => {
        fetchMovies();
        if (selectedMovie && selectedMovie.id === id) {
          setSelectedMovie((prev) => ({
            ...prev,
            watched: !prev.watched,
          }));
        }
      })
      .catch((err) => console.error('Error toggling watched:', err));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const matches = movies.filter((movie) =>
      movie.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMovies(applyFilter(matches, filter));
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setFilteredMovies(applyFilter(movies, newFilter));
  };

  return (
    <div
      style={{
        backgroundImage: 'url(https://daily.jstor.org/wp-content/uploads/2017/11/popcorn_history_1050x700.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          padding: '2rem',
          fontFamily: "'Merriweather', serif",
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center',
          backgroundColor: '#000000e6',
          color: '#fff',
          minHeight: '100vh',
          backgroundImage: 'url(https://wallpapers.com/images/featured/film-reel-png-wkzwgj0y9laly3vs.jpg)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom',
          backgroundSize: '600px',
        }}
      >
         <img
          src="https://wallpapers.com/images/featured/film-reel-png-wkzwgj0y9laly3vs.jpg"
          alt="Film Reel"
          style={{
            width: '100%',
            maxHeight: '200px',
            objectFit: 'cover',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            marginBottom: '0.1rem',
          }}
        />
        <h1>Movie List</h1>

        {/* Add Movie */}
        <form onSubmit={handleAdd} style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Add a movie..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ padding: '0.5rem', marginRight: '1rem', width: '250px' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem' }}>
            Add Movie
          </button>
        </form>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search for a movie..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: '0.5rem', marginRight: '1rem', width: '250px' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem' }}>
            Search
          </button>
        </form>

        {/* Filter Buttons */}
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={() => handleFilterChange('all')}>All</button>{' '}
          <button onClick={() => handleFilterChange('watched')}>Watched</button>{' '}
          <button onClick={() => handleFilterChange('unwatched')}>
            To Watch
          </button>
        </div>

        {/* Movie List */}
        {loading ? (
          <p>Loading...</p>
        ) : filteredMovies.length === 0 ? (
          <p>No matches found.</p>
        ) : (
          <ul>
            {filteredMovies.map((movie) => (
              <li key={movie.id} style={{ marginBottom: '0.5rem' }}>
                <span
                  onClick={() => setSelectedMovie(movie)}
                  className="clickable-title"
                >
                  {movie.title}
                </span>

                <button
                  onClick={() => handleToggleWatched(movie.id)}
                  style={{
                    padding: '0.2rem 0.5rem',
                    backgroundColor: movie.watched ? 'gray' : '#017c7c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    marginRight: '0.5rem',
                  }}
                >
                  {movie.watched ? 'Watched' : 'To Watch'}
                </button>

                <button
                  onClick={() => handleDelete(movie.id)}
                  style={{
                    padding: '0.2rem 0.5rem',
                    color: 'white',
                    backgroundColor: 'black',
                    border: 'none',
                    borderRadius: '4px',
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Info Panel */}
        {selectedMovie && (
          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9',
              position: 'relative',
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto',
              textAlign: 'left',
              color: '#777',
            }}
          >
            <button
              onClick={() => setSelectedMovie(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                fontSize: '1rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: '#888',
              }}
            >
              ❌
            </button>

            <h2>{selectedMovie.title}</h2>
            {selectedMovie.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w200${selectedMovie.poster_path}`}
                alt={selectedMovie.title}
                style={{ marginBottom: '1rem', borderRadius: '8px' }}
              />
            )}
            <p>
              <strong>Plot:</strong>{' '}
              {selectedMovie.overview || 'No description available.'}
            </p>

            <div style={{ marginTop: '1rem' }}>
              <button onClick={() => handleToggleWatched(selectedMovie.id)}>
                Mark as {selectedMovie.watched ? 'Unwatched' : 'Watched'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;