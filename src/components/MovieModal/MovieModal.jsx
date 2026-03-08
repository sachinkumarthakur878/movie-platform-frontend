import React, { useEffect, useState, useCallback } from 'react';
import { movieAPI, favoriteAPI, historyAPI, reviewAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './MovieModal.scss';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w1280';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

const MovieModal = ({ movie, onClose, onToast }) => {
  const { user } = useAuth();
  const [details, setDetails] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [cast, setCast] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [detailsRes, trailerRes, castRes, reviewsRes] = await Promise.all([
        movieAPI.getDetails(movie.id),
        movieAPI.getTrailer(movie.id),
        movieAPI.getCast(movie.id),
        reviewAPI.getByMovie(movie.id),
      ]);

      setDetails(detailsRes.data);
      setTrailer(trailerRes.data);
      setCast(castRes.data?.slice(0, 10) || []);
      setReviews(reviewsRes.data || []);

      // Check favorite
      if (user) {
        try {
          const favRes = await favoriteAPI.getAll();
          setIsFavorite(favRes.data.some(f => String(f.movieId) === String(movie.id)));
        } catch (e) {}

        // Add to history
        try {
          await historyAPI.add({
            movieId: String(movie.id),
            title: movie.title,
            poster: movie.poster_path,
          });
        } catch (e) {}
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [movie.id, user]);

  useEffect(() => {
    fetchData();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [fetchData]);

  const handleFavoriteToggle = async () => {
    if (!user) { onToast?.('Please login to add favorites', 'error'); return; }
    try {
      if (isFavorite) {
        await favoriteAPI.remove(String(movie.id));
        setIsFavorite(false);
        onToast?.('Removed from favorites', 'success');
      } else {
        await favoriteAPI.add({
          movieId: String(movie.id),
          title: movie.title,
          poster: movie.poster_path,
        });
        setIsFavorite(true);
        onToast?.('Added to favorites!', 'success');
      }
    } catch (err) {
      onToast?.('Something went wrong', 'error');
    }
  };

  const handleReviewSubmit = async () => {
    if (!user) { onToast?.('Please login to review', 'error'); return; }
    if (!reviewText.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await reviewAPI.add({ movieId: String(movie.id), review: reviewText, rating });
      setReviews(prev => [{ ...res.data, user: { username: user.username } }, ...prev]);
      setReviewText('');
      setRating(5);
      onToast?.('Review added!', 'success');
    } catch (err) {
      onToast?.('Failed to add review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (id) => {
    try {
      await reviewAPI.delete(id);
      setReviews(prev => prev.filter(r => r._id !== id));
      onToast?.('Review deleted', 'success');
    } catch (err) {
      onToast?.('Failed to delete', 'error');
    }
  };

  const data = details || movie;
  const backdropUrl = data.backdrop_path ? `${IMAGE_BASE}${data.backdrop_path}` : null;
  const posterUrl = data.poster_path ? `${POSTER_BASE}${data.poster_path}` : null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Close */}
        <button className="modal__close" onClick={onClose}>✕</button>

        {/* Backdrop */}
        {backdropUrl && (
          <div className="modal__backdrop" style={{ backgroundImage: `url(${backdropUrl})` }}>
            <div className="backdrop-overlay" />
          </div>
        )}

        <div className="modal__content">
          {loading ? (
            <div className="modal__loading">
              <div className="loading-spinner" />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="modal__header">
                {posterUrl && (
                  <div className="modal__poster">
                    <img src={posterUrl} alt={data.title} />
                  </div>
                )}
                <div className="modal__meta">
                  <div className="meta-tags">
                    {data.genres?.slice(0, 3).map(g => (
                      <span key={g.id} className="tag">{g.name}</span>
                    ))}
                  </div>
                  <h1 className="modal__title">{data.title}</h1>
                  <div className="modal__stats">
                    <span className="stat">
                      <span className="star">⭐</span>
                      {data.vote_average?.toFixed(1)}
                    </span>
                    {data.release_date && (
                      <span className="stat">{data.release_date.slice(0, 4)}</span>
                    )}
                    {data.runtime && (
                      <span className="stat">{Math.floor(data.runtime / 60)}h {data.runtime % 60}m</span>
                    )}
                  </div>
                  <p className="modal__overview">{data.overview}</p>

                  {/* Actions */}
                  <div className="modal__actions">
                    {trailer && (
                      <button className="btn-primary" onClick={() => setShowTrailer(true)}>
                        ▶ Watch Trailer
                      </button>
                    )}
                    <button
                      className={`btn-ghost ${isFavorite ? 'is-fav' : ''}`}
                      onClick={handleFavoriteToggle}
                    >
                      {isFavorite ? '❤️ Saved' : '🤍 Favorite'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Cast */}
              {cast.length > 0 && (
                <div className="modal__section">
                  <h2 className="section-label">Cast</h2>
                  <div className="cast-list">
                    {cast.map(actor => (
                      <div key={actor.id} className="cast-item">
                        <div className="cast-avatar">
                          {actor.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                              alt={actor.name}
                            />
                          ) : (
                            <span>👤</span>
                          )}
                        </div>
                        <span className="cast-name">{actor.name}</span>
                        <span className="cast-character">{actor.character}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="modal__section">
                <h2 className="section-label">Reviews ({reviews.length})</h2>

                {user && (
                  <div className="review-form">
                    <div className="rating-select">
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <button
                          key={n}
                          className={`rating-star ${n <= rating ? 'active' : ''}`}
                          onClick={() => setRating(n)}
                        >
                          {n <= rating ? '⭐' : '☆'}
                        </button>
                      ))}
                      <span className="rating-value">{rating}/10</span>
                    </div>
                    <textarea
                      placeholder="Share your thoughts about this movie..."
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      rows={3}
                    />
                    <button
                      className="btn-primary"
                      onClick={handleReviewSubmit}
                      disabled={submittingReview || !reviewText.trim()}
                    >
                      {submittingReview ? 'Posting...' : 'Post Review'}
                    </button>
                  </div>
                )}

                <div className="reviews-list">
                  {reviews.length === 0 ? (
                    <p className="no-reviews">No reviews yet. Be the first!</p>
                  ) : (
                    reviews.map(r => (
                      <div key={r._id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <span className="reviewer-avatar">
                              {r.user?.username?.[0]?.toUpperCase()}
                            </span>
                            <span className="reviewer-name">{r.user?.username}</span>
                          </div>
                          <div className="review-meta">
                            <span className="review-rating">⭐ {r.rating}/10</span>
                            {user && r.user?._id === user._id && (
                              <button
                                className="delete-review"
                                onClick={() => handleDeleteReview(r._id)}
                              >
                                🗑
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="review-text">{r.review}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div className="trailer-overlay" onClick={() => setShowTrailer(false)}>
          <div className="trailer-container" onClick={e => e.stopPropagation()}>
            <button className="trailer-close" onClick={() => setShowTrailer(false)}>✕</button>
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              title="Trailer"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieModal;
