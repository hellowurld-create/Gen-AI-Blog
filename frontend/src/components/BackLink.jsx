import React from 'react';
import { Link } from 'react-router-dom';
import './BackLink.css';

function BackLink({ to = '/', text = '← Back to Articles' }) {
  return (
    <Link to={to} className="back-link">
      {text}
    </Link>
  );
}

export default BackLink;

