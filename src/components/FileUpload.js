import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractTextFromImage, parseBloodTestResults } from '../services/ocrService';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingStage, setProcessingStage] = useState('');
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      setFileType('');
      return;
    }
    
    // Check file type
    if (selectedFile.type === 'application/pdf') {
      setFileType('pdf');
      setFile(selectedFile);
      setError('');
    } else if (selectedFile.type.startsWith('image/')) {
      setFileType('image');
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a PDF or image file.');
      setFile(null);
      setFileType('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setProgress(0);
    
    try {
      // Step 1: Extract text from the image or PDF using OCR
      setProcessingStage('Extracting text from your document...');
      setProgress(20);
      
      const extractionResult = await extractTextFromImage(file);
      
      if (!extractionResult.success) {
        throw new Error(extractionResult.error || 'Failed to extract text from the document');
      }
      
      setProgress(50);
      
      // Step 2: Parse the extracted text into structured data
      setProcessingStage('Analyzing your blood test results...');
      setProgress(70);
      
      const parsedResults = parseBloodTestResults(extractionResult.text);
      
      // Store the results in sessionStorage
      const extractedData = {
        rawText: extractionResult.text,
        parsedResults: parsedResults,
        timestamp: new Date().toISOString()
      };
      
      setProgress(90);
      sessionStorage.setItem('extractedText', JSON.stringify(extractedData));
      
      // Log extraction success
      console.log('Successfully extracted and parsed blood test data');
      
      setProgress(100);
      
      // Navigate to results page after a brief delay
      setTimeout(() => {
        navigate('/results');
      }, 500);
      
    } catch (err) {
      console.error('File processing error:', err);
      setError('Error processing file: ' + (err.message || 'Please try again with a clearer image or PDF.'));
    } finally {
      setIsLoading(false);
      setProcessingStage('');
    }
  };

  // Function to handle when user drops a file
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      if (droppedFile.type === 'application/pdf' || droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
        setFileType(droppedFile.type === 'application/pdf' ? 'pdf' : 'image');
        setError('');
      } else {
        setError('Please upload a PDF or image file.');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="file-upload-container">
      <h2>Upload Blood Test Results</h2>
      <p>Please upload an image or PDF of your blood test results for AI-powered analysis.</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div 
          className="file-drop-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            accept="image/*,.pdf"
            disabled={isLoading}
            className="file-input"
          />
          <label htmlFor="file-upload" className="file-input-label">
            {file ? file.name : 'Choose a file or drag it here'}
          </label>
          <p className="drag-text">Drag and drop a file here, or click to select</p>
        </div>
        
        {file && (
          <div className="file-preview">
            <p>Selected file: {file.name}</p>
            {fileType === 'image' && (
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="image-preview"
              />
            )}
            {fileType === 'pdf' && (
              <div className="pdf-preview">
                <i className="pdf-icon"></i>
                <p className="pdf-label">PDF Document</p>
              </div>
            )}
          </div>
        )}
        
        <button
          type="submit"
          className="btn-primary"
          disabled={!file || isLoading}
        >
          {isLoading ? 'Processing...' : 'Analyze Results'}
        </button>
      </form>
      
      {isLoading && (
        <div className="processing-status">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p>{processingStage}</p>
          <div className="loading-spinner"></div>
        </div>
      )}
      
      <div className="upload-tips">
        <h3>Tips for best results:</h3>
        <ul>
          <li>Use a clear, well-lit photo of your results</li>
          <li>Make sure text is readable and not blurry</li>
          <li>Include both test values and reference ranges if possible</li>
          <li>PDF files from lab portals work best</li>
          <li>Take the photo straight-on to avoid distortion</li>
        </ul>
      </div>
      
      <div className="upload-privacy">
        <h3>Privacy Information</h3>
        <p>
          Your data is processed securely. We use Google Cloud Vision API for text extraction 
          and OpenAI for analysis. Your data is not stored permanently and is only used 
          to provide you with insights about your test results.
        </p>
      </div>
    </div>
  );
}

export default FileUpload;