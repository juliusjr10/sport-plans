import React, { useState } from 'react'; // Import useState from React
import { Link, NavLink, useNavigate } from 'react-router-dom'; // Import Link, NavLink, and useNavigate from react-router-dom
import './Navbar.css'; // Make sure to include your CSS

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = Boolean(localStorage.getItem('authToken'));

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <nav>
      <Link to="/" className="title">
        Sports plans app
      </Link>
      <div className="menu" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <ul className={menuOpen ? "open" : ""}>
        {isLoggedIn ? (
          <li>
            <button className="auth-btn logout-btn" onClick={handleLogout}>
              Log Out
            </button>
          </li>
        ) : (
          <>
            <li>
              <NavLink to="/" className="auth-btn">
                Log In
              </NavLink>
            </li>
            <li>
              <NavLink to="/register" className="auth-btn">
                Register
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};
