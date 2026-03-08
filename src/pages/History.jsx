import React, { useState, useEffect } from 'react';
import { historyAPI } from '../services/api';
import MovieModal from '../components/MovieModal/MovieModal';
import './ListPage.scss';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    historyAPI.getAll()
      .then(res => setHistory(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (movieId) => {
    try {
      await historyAPI.remove(movieId);
      setHistory(prev => prev.filter(h => h.movieId !== movieId));
      showToast('Removed from history');
    } catch {
      showToast('Failed to remove', 'error');
    }
  };

  return (
    <div className="list-page">
      <div className="container">
        <div className="list-page__header">
          <h1 className="section-title">Watch <span>History</span></h1>
          <span className="count-badge">{history.length} movies</span>
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
        ) : history.length === 0 ? (
          <div className="empty-state">
            <span>🕐</span>
            <h2>No history yet</h2>
            <p>Movies you view will appear here</p>
          </div>
        ) : (
          <div className="list-grid">
            {history.map(item => (
              <div
                key={item._id}
                className="list-item"
                onClick={() => setSelectedMovie({ id: item.movieId, title: item.title, poster_path: item.poster })}
              >
                <div className="list-item__poster">
                  {item.poster ? (
                    <img src={`${IMAGE_BASE}${item.poster}`} alt={item.title} loading="lazy" />
                  ) : (
                    <div className="no-poster">🎬</div>
                  )}
                </div>
                <div className="list-item__info">
                  <h3>{item.title}</h3>
                  <p className="list-date">
                    🕐 {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  className="list-item__remove"
                  onClick={e => { e.stopPropagation(); handleDelete(item.movieId); }}
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

export default History;
