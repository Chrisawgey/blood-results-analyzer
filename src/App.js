import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProfileForm from './components/ProfileForm';
import FileUpload from './components/FileUpload';
import ResultsAnalysis from './components/ResultsAnalysis';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<ProfileForm />} />
            <Route path="/upload" element={<FileUpload />} />
            <Route path="/results" element={<ResultsAnalysis />} />
          </Routes>
        </div>
        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} Blood Results Analyzer. All rights reserved.</p>
          <p className="disclaimer">This app is for educational and informational purposes only.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;