import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const NAV_ITEMS = [
    { path: '/projects', label: 'Projects' },
    { path: '/task-manager', label: 'Tasks' },
    { path: '/resource-manager', label: 'Resources' },
  ];

  const handleNavigation = (path) => () => {
    navigate(path);
  };

  const styles = {
    header: {
      backgroundColor: '#333',
      color: 'white',
      padding: '10px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      fontSize: '24px',
      fontWeight: 'bold',
    },
    nav: {
      display: 'flex',
      gap: '10px',
    },
    button: (isActive) => ({
      backgroundColor: isActive ? '#0056b3' : '#007bff',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      cursor: 'pointer',
      fontSize: '16px',
      borderRadius: '5px',
      transition: 'background-color 0.3s ease',
    }),
  };

  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <h1>Project Management App</h1>
      </div>
      <nav style={styles.nav}>
        {NAV_ITEMS.map(({ path, label }) => (
          <button
            key={path}
            style={styles.button(location.pathname === path)}
            onClick={handleNavigation(path)}
          >
            {label}
          </button>
        ))}
        
        {isLoggedIn ? (
          <button
            style={styles.button(false)}
            onClick={onLogout}
          >
            Logout
          </button>
        ) : (
          <button
            style={styles.button(false)}
            onClick={handleNavigation('/login')}
          >
            Login
          </button>
        )}
      </nav>
    </header>
  );
};

export default Header;
