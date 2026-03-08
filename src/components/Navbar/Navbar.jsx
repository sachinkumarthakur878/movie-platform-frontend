import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.scss';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">MOVIE<span>HUB</span></span>
        </Link>

        {/* Nav Links */}
        <ul className={`navbar__links ${menuOpen ? 'open' : ''}`}>
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
              Home
            </Link>
          </li>
          {user && (
            <>
              <li>
                <Link to="/favorites" className={isActive('/favorites') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                  Favorites
                </Link>
              </li>
              <li>
                <Link to="/history" className={isActive('/history') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                  History
                </Link>
              </li>
              {user.role === 'admin' && (
                <li>
                  <Link to="/admin" className={isActive('/admin') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>

        {/* Auth Buttons */}
        <div className="navbar__auth">
          {user ? (
            <div className="navbar__user">
              <div className="user-avatar" onClick={() => setMenuOpen(!menuOpen)}>
                {user.username?.[0]?.toUpperCase()}
              </div>
              <div className="user-dropdown">
                <div className="user-info">
                  <span className="user-name">{user.username}</span>
                  <span className="user-role">{user.role}</span>
                </div>
                <div className="dropdown-links">
                  <Link to="/favorites" onClick={() => setMenuOpen(false)}>⭐ Favorites</Link>
                  <Link to="/history" onClick={() => setMenuOpen(false)}>🕐 History</Link>
                  {user.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)}>⚙️ Admin</Link>}
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/register" className="btn-primary">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="navbar__toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
