import React from 'react';
import { Link } from 'react-router-dom';
import './ErrorMessage.css';

function ErrorMessage({ message, onRetry, showBackLink = false }) {
  return (
    <div className="error-container">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          Retry
        </button>
      )}
      {showBackLink && (
        <Link to="/" className="back-link">
          ← Back to Articles
        </Link>
      )}
    </div>
  );
}

export default ErrorMessage;

