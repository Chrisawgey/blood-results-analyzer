import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [hasProfile, setHasProfile] = useState(false);
  const [recentResults, setRecentResults] = useState([]);

  useEffect(() => {
    // Check if user has created a profile
    const userProfile = localStorage.getItem('userProfile');
    setHasProfile(!!userProfile);
    
    // Get recent analysis (in a real app, this would be stored in a database)
    const recentAnalysis = localStorage.getItem('recentAnalysis');
    if (recentAnalysis) {
      try {
        setRecentResults(JSON.parse(recentAnalysis));
      } catch (err) {
        console.error('Error parsing recent results:', err);
        setRecentResults([]);
      }
    }
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Welcome to Your Blood Results Analyzer</h2>
      
      <div className="dashboard-cards">
        {!hasProfile && (
          <div className="card get-started-card">
            <h3>Get Started</h3>
            <p>Complete your profile to get personalized analysis of your blood test results.</p>
            <Link to="/profile" className="btn-primary">Create Profile</Link>
          </div>
        )}
        
        <div className="card upload-card">
          <h3>Upload Test Results</h3>
          <p>Upload an image or PDF of your blood test results for instant analysis.</p>
          <Link to="/upload" className="btn-primary">Upload Results</Link>
        </div>
        
        {hasProfile && (
          <div className="card profile-card">
            <h3>Your Profile</h3>
            <p>Update your health profile to improve result analysis accuracy.</p>
            <Link to="/profile" className="btn-secondary">View Profile</Link>
          </div>
        )}
      </div>
      
      {recentResults.length > 0 && (
        <div className="recent-results">
          <h3>Recent Analyses</h3>
          <div className="results-list">
            {recentResults.map((result, index) => (
              <div key={index} className="result-item">
                <span className="result-date">{new Date(result.date).toLocaleDateString()}</span>
                <span className="result-title">{result.title}</span>
                <Link to={`/results/${result.id}`} className="btn-text">View Results</Link>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="info-section">
        <h3>How It Works</h3>
        <ol>
          <li>Complete your health profile with age, gender, and other relevant information</li>
          <li>Upload a clear photo or PDF of your blood test results</li>
          <li>Get instant analysis with personalized insights</li>
          <li>Save and track your results over time</li>
        </ol>
        <p className="disclaimer">
          Note: This app provides informational insights only and is not a substitute for professional medical advice.
          Always consult with your healthcare provider about your test results.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;