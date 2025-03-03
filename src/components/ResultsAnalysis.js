import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ResultsAnalysis() {
  const [results, setResults] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if we have extracted text from the uploaded file
    const extractedData = sessionStorage.getItem('extractedText');
    if (!extractedData) {
      setError('No results data found. Please upload your blood test results first.');
      setLoading(false);
      return;
    }
    
    // Check if we have user profile data
    const userProfile = localStorage.getItem('userProfile');
    if (!userProfile) {
      setError('User profile information is needed for accurate analysis.');
      setLoading(false);
      return;
    }
    
    try {
      const { parsedResults } = JSON.parse(extractedData);
      const profile = JSON.parse(userProfile);
      
      // Analyze the results (this would be part of the service in a real app)
      // For now we'll create dummy analysis results
      const analyzedResults = {};
      
      Object.keys(parsedResults).forEach(param => {
        const value = parsedResults[param].value;
        let status, interpretation;
        
        // Dummy logic based on parameter
        if (param === 'Hemoglobin') {
          status = value < 12 ? 'Low' : value > 16 ? 'High' : 'Normal';
          interpretation = status === 'Normal' 
            ? 'Your hemoglobin level is within normal range.' 
            : `Your hemoglobin is ${status.toLowerCase()}. This may indicate ${status === 'Low' ? 'anemia' : 'polycythemia'}.`;
        } else if (param === 'Glucose') {
          status = value < 70 ? 'Low' : value > 100 ? 'High' : 'Normal';
          interpretation = status === 'Normal' 
            ? 'Your glucose level is within normal range.' 
            : `Your glucose is ${status.toLowerCase()}. This may indicate ${status === 'Low' ? 'hypoglycemia' : 'prediabetes'}.`;
        } else {
          // Generic status for other parameters
          status = 'Normal';
          interpretation = `Your ${param} level is within normal range.`;
        }
        
        analyzedResults[param] = {
          ...parsedResults[param],
          status,
          interpretation
        };
      });
      
      // Generate summary
      const abnormalParams = Object.keys(analyzedResults).filter(
        param => analyzedResults[param].status !== 'Normal'
      );
      
      const summaryText = abnormalParams.length === 0
        ? 'All tested parameters are within normal ranges. Your results look good!'
        : `We found ${abnormalParams.length} abnormal parameters in your results. Please consult with a healthcare provider.`;
      
      setResults(analyzedResults);
      setSummary({
        text: summaryText,
        abnormalCount: abnormalParams.length,
        abnormalParams
      });
      
    } catch (err) {
      console.error('Error analyzing results:', err);
      setError('Error analyzing your blood test results. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const handleUpdateProfile = () => {
    navigate('/profile');
  };
  
  const handleNewUpload = () => {
    navigate('/upload');
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Analyzing your results...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <div className="button-group">
          <button onClick={handleUpdateProfile} className="btn-secondary">Update Profile</button>
          <button onClick={handleNewUpload} className="btn-primary">Upload Results</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="results-container">
      <h2>Your Blood Test Analysis</h2>
      
      <div className="results-summary">
        <h3>Summary</h3>
        <p>{summary.text}</p>
        {summary.abnormalCount > 0 && (
          <div className="abnormal-parameters">
            <p>Abnormal parameters:</p>
            <ul>
              {summary.abnormalParams.map(param => (
                <li key={param}>
                  <strong>{param}</strong>: {results[param].status}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="detailed-results">
        <h3>Detailed Results</h3>
        <table className="results-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Value</th>
              <th>Status</th>
              <th>Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {results && Object.keys(results).map(param => (
              <tr key={param} className={`status-${results[param].status.toLowerCase()}`}>
                <td>{param}</td>
                <td>{results[param].value} {results[param].unit}</td>
                <td>{results[param].status}</td>
                <td>{results[param].interpretation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="disclaimer">
        <p>
          <strong>Disclaimer:</strong> This analysis is for informational purposes only and is not a substitute for professional medical advice.
          Always consult with your healthcare provider about your test results.
        </p>
      </div>
      
      <div className="results-actions">
        <button onClick={handleNewUpload} className="btn-primary">Analyze Another Test</button>
        <button className="btn-secondary">Save Results</button>
        <button className="btn-secondary">Print Report</button>
      </div>
    </div>
  );
}

export default ResultsAnalysis;