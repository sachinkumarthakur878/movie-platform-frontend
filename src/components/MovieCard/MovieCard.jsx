import React from 'react';
import './MovieCard.scss';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const MovieCard = ({ movie, onClick, isFavorite, onFavoriteToggle }) => {
  const posterUrl = movie.poster_path
    ? `${IMAGE_BASE}${movie.poster_path}`
    : null;

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '';

  const getRatingColor = (r) => {
    const num = parseFloat(r);
    if (num >= 7.5) return '#4ade80';
    if (num >= 6) return '#f4a261';
    return '#f87171';
  };

  return (
    <div className="movie-card" onClick={() => onClick && onClick(movie)}>
      {/* Poster */}
      <div className="movie-card__poster">
        {posterUrl ? (
          <img src={posterUrl} alt={movie.title} loading="lazy" />
        ) : (
          <div className="no-poster">
            <span>🎬</span>
            <p>{movie.title}</p>
          </div>
        )}

        {/* Overlay */}
        <div className="movie-card__overlay">
          <button className="play-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>

        {/* Favorite Button */}
        {onFavoriteToggle && (
          <button
            className={`fav-btn ${isFavorite ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(movie);
            }}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        )}

        {/* Rating Badge */}
        <div className="rating-badge" style={{ color: getRatingColor(rating) }}>
          ⭐ {rating}
        </div>
      </div>

      {/* Info */}
      <div className="movie-card__info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span className="year">{year}</span>
          {movie.genre_ids?.length > 0 && (
            <span className="genre-dot">•</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
