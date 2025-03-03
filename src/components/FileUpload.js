import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractTextFromImage, parseBloodTestResults } from '../services/ocrService';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingStage, setProcessingStage] = useState('');
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
    
    try {
      // Step 1: Extract text from the image or PDF using OCR
      setProcessingStage('Extracting text from your document...');
      const extractionResult = await extractTextFromImage(file);
      
      if (!extractionResult.success) {
        throw new Error(extractionResult.error || 'Failed to extract text from the document');
      }
      
      // Step 2: Parse the extracted text into structured data
      setProcessingStage('Analyzing your blood test results...');
      const parsedResults = parseBloodTestResults(extractionResult.text);
      
      // Store the results in sessionStorage
      const extractedData = {
        rawText: extractionResult.text,
        parsedResults: parsedResults
      };
      
      sessionStorage.setItem('extractedText', JSON.stringify(extractedData));
      
      // Navigate to results page
      navigate('/results');
    } catch (err) {
      console.error('File processing error:', err);
      setError('Error processing file: ' + err.message || 'Please try again with a clearer image or PDF.');
    } finally {
      setIsLoading(false);
      setProcessingStage('');
    }
  };

  return (
    <div className="file-upload-container">
      <h2>Upload Blood Test Results</h2>
      <p>Please upload an image or PDF of your blood test results for AI-powered analysis.</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="file-input-container">
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            accept="image/*,.pdf"
            disabled={isLoading}
          />
          <label htmlFor="file-upload" className="file-input-label">
            {file ? file.name : 'Choose file'}
          </label>
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
              <p className="pdf-label">PDF Document</p>
            )}
          </div>
        )}
        
        <button
          type="submit"
          className="btn-primary"
          disabled={!file || isLoading}
        >
          {isLoading ? processingStage || 'Processing...' : 'Analyze Results'}
        </button>
      </form>
      
      {isLoading && (
        <div className="processing-status">
          <div className="loading-spinner"></div>
          <p>{processingStage}</p>
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
    </div>
  );
}

export default FileUpload;