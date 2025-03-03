import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeBloodResults, getMedicalInsights } from '../services/medicalAnalysisService';

function ResultsAnalysis() {
  const [results, setResults] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState([]);
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('loading');
  const navigate = useNavigate();
  
  useEffect(() => {
    const analyzeResults = async () => {
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
        setStage('analyzing');
        const { parsedResults } = JSON.parse(extractedData);
        const profile = JSON.parse(userProfile);
        
        // Step 1: Analyze the blood test results
        const analysisResult = await analyzeBloodResults(parsedResults, profile);
        
        if (!analysisResult.success) {
          throw new Error(analysisResult.error || 'Failed to analyze blood test results');
        }
        
        setResults(analysisResult.analysis);
        setSummary(analysisResult.summary);
        setRecommendations(analysisResult.recommendations);
        
        // Step 2: Get AI-powered medical insights
        setStage('generating insights');
        const insightsResult = await getMedicalInsights(
          parsedResults, 
          profile, 
          analysisResult.analysis
        );
        
        if (insightsResult.success) {
          setInsights(insightsResult.insights);
          setFollowUpQuestions(insightsResult.followUpQuestions);
        }
        
        // Store the analysis in localStorage for history
        const recentAnalysis = localStorage.getItem('recentAnalysis');
        const recentItems = recentAnalysis ? JSON.parse(recentAnalysis) : [];
        
        const newAnalysisItem = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          title: 'Blood Test Results',
          summary: analysisResult.summary
        };
        
        localStorage.setItem(
          'recentAnalysis', 
          JSON.stringify([newAnalysisItem, ...recentItems].slice(0, 10))
        );
        
      } catch (err) {
        console.error('Error analyzing results:', err);
        setError('Error analyzing your blood test results: ' + err.message);
      } finally {
        setLoading(false);
        setStage('complete');
      }
    };
    
    analyzeResults();
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
        <p>
          {stage === 'analyzing' 
            ? 'Analyzing your blood test results...' 
            : stage === 'generating insights'
            ? 'Generating medical insights with AI...'
            : 'Processing your results...'
          }
        </p>
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
        <p>{summary}</p>
        
        <div className="summary-metrics">
          {/* Count normal, flagged, and critical values */}
          {results && (
            <>
              <div className="metric">
                <span className="metric-value">
                  {Object.values(results).filter(r => r.status === 'Normal').length}
                </span>
                <span className="metric-label">Normal</span>
              </div>
              <div className="metric">
                <span className="metric-value">
                  {Object.values(results).filter(r => r.status !== 'Normal' && r.status !== 'High').length}
                </span>
                <span className="metric-label">Flagged</span>
              </div>
              <div className="metric">
                <span className="metric-value">
                  {Object.values(results).filter(r => r.status === 'High').length}
                </span>
                <span className="metric-label">High</span>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="ai-insights">
        <h3>AI-Powered Insights</h3>
        <div className="insights-content">
          {insights.length > 0 ? (
            <ul className="insights-list">
              {insights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          ) : (
            <p>No additional insights available for this test.</p>
          )}
        </div>
      </div>
      
      <div className="recommendations">
        <h3>Recommendations</h3>
        <ul className="recommendations-list">
          {recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>
      
      <div className="detailed-results">
        <h3>Detailed Results</h3>
        <table className="results-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Value</th>
              <th>Reference Range</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {results && Object.keys(results).map(param => (
              <tr key={param} className={`status-${results[param].status.toLowerCase()}`}>
                <td>{param}</td>
                <td>{results[param].value} {results[param].unit}</td>
                <td>{results[param].refRange}</td>
                <td>{results[param].status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="interpretations">
        <h3>Interpretations</h3>
        {results && Object.keys(results).map(param => (
          <div key={param} className="interpretation-item">
            <h4>{param}</h4>
            <p>{results[param].interpretation}</p>
          </div>
        ))}
      </div>
      
      {followUpQuestions.length > 0 && (
        <div className="follow-up-questions">
          <h3>Follow-up Considerations</h3>
          <ul className="questions-list">
            {followUpQuestions.map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="disclaimer">
        <p>
          <strong>Disclaimer:</strong> This analysis is for informational purposes only and is not a substitute for professional medical advice.
          The AI-powered insights are based on general medical knowledge and should be verified by healthcare professionals.
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