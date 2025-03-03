import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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
      // In a real app, we would process the file here
      // For now, we'll simulate a file processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate extracted text (in a real app this would come from OCR/PDF processing)
      const extractedText = {
        extractedText: "Sample blood test results data",
        parsedResults: {
          'Hemoglobin': { value: 14.2, unit: 'g/dL' },
          'WBC': { value: 6.8, unit: 'thousand/μL' },
          'Platelets': { value: 250, unit: 'thousand/μL' },
          'Glucose': { value: 95, unit: 'mg/dL' },
          'Cholesterol': { value: 180, unit: 'mg/dL' },
          'HDL': { value: 55, unit: 'mg/dL' },
          'LDL': { value: 110, unit: 'mg/dL' }
        }
      };
      
      // Store the extracted text in sessionStorage for the analysis component
      sessionStorage.setItem('extractedText', JSON.stringify(extractedText));
      
      // Navigate to results page
      navigate('/results');
    } catch (err) {
      console.error('File processing error:', err);
      setError('Error processing file. Please try again with a clearer image or PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="file-upload-container">
      <h2>Upload Blood Test Results</h2>
      <p>Please upload an image or PDF of your blood test results.</p>
      
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
          {isLoading ? 'Processing...' : 'Analyze Results'}
        </button>
      </form>
      
      <div className="upload-tips">
        <h3>Tips for best results:</h3>
        <ul>
          <li>Use a clear, well-lit photo of your results</li>
          <li>Make sure text is readable and not blurry</li>
          <li>Include both test values and reference ranges if possible</li>
          <li>PDF files from lab portals work best</li>
        </ul>
      </div>
    </div>
  );
}

export default FileUpload;