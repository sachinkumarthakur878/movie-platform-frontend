# 🎬 MovieHub Frontend

React-based frontend for the MovieHub backend — dark cinematic design, SCSS styling, Axios API integration.

## Tech Stack
- **React 18** + React Router v6
- **SCSS** (modular per component)
- **Axios** (with interceptors for JWT)
- **Context API** (Auth state management)

## Project Structure

```
src/
├── components/
│   ├── Navbar/          # Sticky navbar with user dropdown
│   ├── MovieCard/       # Movie grid card with hover effects
│   ├── MovieModal/      # Full detail modal (trailer, cast, reviews)
│   └── ProtectedRoute.jsx
├── context/
│   └── AuthContext.jsx  # Global auth state
├── pages/
│   ├── Home.jsx         # Hero + trending + search
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Favorites.jsx    # User favorites list
│   ├── History.jsx      # Watch history
│   └── Admin.jsx        # Admin user management
├── services/
│   └── api.js           # All Axios API calls (authAPI, movieAPI, etc.)
└── styles/
    └── global.scss      # CSS variables, reset, utilities
```

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Backend
Make sure your backend is running on `http://localhost:5000`

### 3. Start Frontend
```bash
npm start
```
Opens at `http://localhost:3000`

## API Endpoints Used

| Feature | Endpoint |
|---------|---------|
| Register | POST `/api/auth/register` |
| Login | POST `/api/auth/login` |
| Get Profile | GET `/api/auth/me` |
| Trending | GET `/api/movies/trending` |
| Search | GET `/api/movies/search?q=` |
| Movie Detail | GET `/api/movies/:id` |
| Trailer | GET `/api/movies/:id/trailer` |
| Cast | GET `/api/movies/:id/cast` |
| Add Favorite | POST `/api/favorites` |
| Get Favorites | GET `/api/favorites` |
| Remove Favorite | DELETE `/api/favorites/:movieId` |
| Add History | POST `/api/history` |
| Get History | GET `/api/history` |
| Delete History | DELETE `/api/history/:movieId` |
| Add Review | POST `/api/reviews` |
| Get Reviews | GET `/api/reviews/:movieId` |
| Delete Review | DELETE `/api/reviews/:id` |
| Get Users (Admin) | GET `/api/admin/users` |
| Delete User (Admin) | DELETE `/api/admin/user/:id` |

## Features
- 🔥 Hero section with trending movie backdrop
- 🔍 Real-time search with debounce
- 🎬 Movie modal with trailer, cast, reviews
- ❤️ Favorites management
- 🕐 Watch history tracking
- ⭐ Movie reviews with ratings
- 👤 JWT authentication
- ⚙️ Admin dashboard (users management)
- 📱 Responsive design
