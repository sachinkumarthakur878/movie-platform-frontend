import React, { useState, useEffect, useCallback } from 'react';
import { movieAPI, favoriteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard/MovieCard';
import MovieModal from '../components/MovieModal/MovieModal';
import './Home.scss';

const Home = () => {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [toast, setToast] = useState(null);
  const [heroMovie, setHeroMovie] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await movieAPI.getTrending();
        const data = res.data.results || res.data;
        setMovies(data);
        if (data.length > 0) setHeroMovie(data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    if (user) {
      favoriteAPI.getAll()
        .then(res => setFavorites(res.data.map(f => String(f.movieId))))
        .catch(() => {});
    }
  }, [user]);

  const handleSearch = useCallback(async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await movieAPI.search(q);
      setSearchResults(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const handleFavoriteToggle = async (movie) => {
    if (!user) { showToast('Please login to add favorites', 'error'); return; }
    const id = String(movie.id);
    try {
      if (favorites.includes(id)) {
        await favoriteAPI.remove(id);
        setFavorites(prev => prev.filter(f => f !== id));
        showToast('Removed from favorites');
      } else {
        await favoriteAPI.add({ movieId: id, title: movie.title, poster: movie.poster_path });
        setFavorites(prev => [...prev, id]);
        showToast('Added to favorites!');
      }
    } catch (err) {
      showToast('Something went wrong', 'error');
    }
  };

  const displayMovies = searchQuery ? searchResults : movies;
  const IMAGE_BASE = 'https://image.tmdb.org/t/p/w1280';

  return (
    <div className="home">
      {/* Hero Section */}
      {heroMovie && !searchQuery && (
        <div
          className="hero"
          style={{ backgroundImage: heroMovie.backdrop_path ? `url(${IMAGE_BASE}${heroMovie.backdrop_path})` : undefined }}
        >
          <div className="hero__overlay" />
          <div className="hero__content container">
            <div className="hero__badge">🔥 Trending Now</div>
            <h1 className="hero__title">{heroMovie.title}</h1>
            <p className="hero__overview">{heroMovie.overview?.slice(0, 180)}...</p>
            <div className="hero__actions">
              <button
                className="btn-primary hero-btn"
                onClick={() => setSelectedMovie(heroMovie)}
              >
                ▶ Watch Details
              </button>
              <button
                className="btn-ghost hero-btn"
                onClick={() => handleFavoriteToggle(heroMovie)}
              >
                {favorites.includes(String(heroMovie.id)) ? '❤️ Saved' : '🤍 Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="home__main container">
        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search movies, series, actors..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
        </div>

        {/* Movies Grid */}
        <div className="movies-section">
          <div className="section-header">
            <h2 className="section-title">
              {searchQuery
                ? <><span>Search</span> Results</>
                : <><span>Trending</span> Movies</>
              }
            </h2>
            {searching && <div className="mini-loader" />}
          </div>

          {loading ? (
            <div className="movies-grid">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="movie-skeleton">
                  <div className="skeleton poster-sk" />
                  <div className="skeleton title-sk" />
                  <div className="skeleton meta-sk" />
                </div>
              ))}
            </div>
          ) : displayMovies.length === 0 ? (
            <div className="empty-state">
              <span>🎬</span>
              <p>{searchQuery ? 'No movies found' : 'No trending movies'}</p>
            </div>
          ) : (
            <div className="movies-grid">
              {displayMovies.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={setSelectedMovie}
                  isFavorite={favorites.includes(String(movie.id))}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Movie Modal */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onToast={showToast}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
};

export default Home;
