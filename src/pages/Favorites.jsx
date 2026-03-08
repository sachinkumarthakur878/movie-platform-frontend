import React, { useState, useEffect } from 'react';
import { favoriteAPI } from '../services/api';
import MovieModal from '../components/MovieModal/MovieModal';
import './ListPage.scss';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    favoriteAPI.getAll()
      .then(res => setFavorites(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (movieId) => {
    try {
      await favoriteAPI.remove(movieId);
      setFavorites(prev => prev.filter(f => f.movieId !== movieId));
      showToast('Removed from favorites');
    } catch {
      showToast('Failed to remove', 'error');
    }
  };

  return (
    <div className="list-page">
      <div className="container">
        <div className="list-page__header">
          <h1 className="section-title">Your <span>Favorites</span></h1>
          <span className="count-badge">{favorites.length} movies</span>
        </div>

        {loading ? (
          <div className="list-grid">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="list-skeleton">
                <div className="skeleton list-sk-poster" />
                <div className="list-sk-info">
                  <div className="skeleton sk-title" />
                  <div className="skeleton sk-meta" />
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="empty-state">
            <span>💔</span>
            <h2>No favorites yet</h2>
            <p>Start adding movies you love</p>
          </div>
        ) : (
          <div className="list-grid">
            {favorites.map(fav => (
              <div key={fav._id} className="list-item" onClick={() => setSelectedMovie({ id: fav.movieId, title: fav.title, poster_path: fav.poster })}>
                <div className="list-item__poster">
                  {fav.poster ? (
                    <img src={`${IMAGE_BASE}${fav.poster}`} alt={fav.title} loading="lazy" />
                  ) : (
                    <div className="no-poster">🎬</div>
                  )}
                </div>
                <div className="list-item__info">
                  <h3>{fav.title}</h3>
                  <p className="list-date">Added {new Date(fav.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  className="list-item__remove"
                  onClick={e => { e.stopPropagation(); handleRemove(fav.movieId); }}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onToast={showToast}
        />
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
};

export default Favorites;
