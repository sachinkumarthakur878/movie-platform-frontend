import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './Admin.scss';

const Admin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    adminAPI.getUsers()
      .then(res => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!user || user.role !== 'admin') return <Navigate to="/" />;

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      showToast('User deleted');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1 className="section-title">Admin <span>Dashboard</span></h1>
            <p className="admin-sub">Manage users and platform settings</p>
          </div>
          <div className="admin-stats">
            <div className="stat-card">
              <span className="stat-icon">👥</span>
              <div>
                <div className="stat-value">{users.length}</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🛡️</span>
              <div>
                <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
                <div className="stat-label">Admins</div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-section">
          <h2 className="admin-section-title">All Users</h2>

          {loading ? (
            <div className="users-table-wrap">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="user-row skeleton-row">
                  <div className="skeleton av-sk" />
                  <div className="skeleton info-sk" />
                  <div className="skeleton role-sk" />
                </div>
              ))}
            </div>
          ) : (
            <div className="users-table-wrap">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className={u._id === user._id ? 'current-user' : ''}>
                      <td>
                        <div className="user-cell">
                          <div className="user-av">
                            {u.username?.[0]?.toUpperCase()}
                          </div>
                          <span>{u.username}</span>
                          {u._id === user._id && <span className="you-badge">You</span>}
                        </div>
                      </td>
                      <td className="email-cell">{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {u.role === 'admin' ? '⚙️' : '👤'} {u.role}
                        </span>
                      </td>
                      <td className="date-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {u._id !== user._id && (
                          <button className="delete-btn" onClick={() => handleDelete(u._id)}>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
};

export default Admin;
