import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="app-header">
      <h1>Blood Results Analyzer</h1>
      <nav>
        <ul>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/profile">My Profile</Link></li>
          <li><Link to="/upload">Upload Results</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;