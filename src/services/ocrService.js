// src/services/ocrService.js
import axios from 'axios';

// OCR API Integration (using Google Cloud Vision API)
export const extractTextFromImage = async (file) => {
  try {
    // For images, we can use Google Cloud Vision API
    if (file.type.startsWith('image/')) {
      return await processImageWithVisionAPI(file);
    } 
    // For PDFs, we can use a PDF extraction API like DocumentAI or a specialized OCR service
    else if (file.type === 'application/pdf') {
      return await processPdfWithDocumentAPI(file);
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('OCR extraction error:', error);
    return {
      success: false,
      error: error.message || 'Failed to extract text from document'
    };
  }
};

// Process image with Google Cloud Vision API
async function processImageWithVisionAPI(imageFile) {
  // Convert file to base64
  const base64Image = await fileToBase64(imageFile);
  
  // Prepare request for Google Cloud Vision API
  const visionApiEndpoint = 'https://vision.googleapis.com/v1/images:annotate';
  const apiKey = process.env.REACT_APP_GOOGLE_CLOUD_API_KEY;
  
  const requestData = {
    requests: [
      {
        image: {
          content: base64Image.split(',')[1] // Remove data URL prefix
        },
        features: [
          {
            type: 'TEXT_DETECTION',
            maxResults: 1
          }
        ]
      }
    ]
  };

  // Make API request
  const response = await axios.post(
    `${visionApiEndpoint}?key=${apiKey}`,
    requestData
  );
  
  // Extract and return text
  if (
    response.data &&
    response.data.responses &&
    response.data.responses[0] &&
    response.data.responses[0].fullTextAnnotation
  ) {
    return {
      success: true,
      text: response.data.responses[0].fullTextAnnotation.text
    };
  } else {
    throw new Error('No text detected in the image');
  }
}

// Process PDF with Document AI or a PDF extraction service
async function processPdfWithDocumentAPI(pdfFile) {
  // For PDFs, you might use Google's Document AI or a specialized service
  // Here's an example using Document AI
  const documentAiEndpoint = 'https://documentai.googleapis.com/v1/projects/{projectId}/locations/us/processors/{processorId}:process';
  const apiKey = process.env.REACT_APP_GOOGLE_CLOUD_API_KEY;
  const projectId = process.env.REACT_APP_GOOGLE_CLOUD_PROJECT_ID;
  const processorId = process.env.REACT_APP_DOCUMENT_AI_PROCESSOR_ID;
  
  // Convert file to base64
  const base64Pdf = await fileToBase64(pdfFile);
  
  const requestData = {
    rawDocument: {
      content: base64Pdf.split(',')[1],
      mimeType: 'application/pdf'
    }
  };

  // Replace placeholders in the URL
  const endpoint = documentAiEndpoint
    .replace('{projectId}', projectId)
    .replace('{processorId}', processorId);

  // Make API request
  const response = await axios.post(
    `${endpoint}?key=${apiKey}`,
    requestData
  );
  
  if (response.data && response.data.document && response.data.document.text) {
    return {
      success: true,
      text: response.data.document.text
    };
  } else {
    throw new Error('Failed to extract text from PDF');
  }
}

// Helper function to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Parse the extracted text into structured blood test data
export const parseBloodTestResults = (text) => {
  // This function parses the raw OCR text into structured data
  // Enhanced regex pattern to handle different lab report formats
  const results = {};
  const lines = text.split('\n');
  
  // Extract test sections (Complete Blood Count, Metabolic Panel, etc.)
  let currentSection = 'General';
  
  lines.forEach(line => {
    // Check if line indicates a new section
    if (line.match(/^[A-Z\s]{3,}:?$/)) {
      currentSection = line.replace(':', '').trim();
      return;
    }
    
    // Look for patterns like "Test: Value Unit (Ref: Range)" or "Test Value Unit (Range)"
    const patternWithColon = /([^:]+):\s*([\d.]+)\s*([^\s(]+)\s*(?:\((?:Ref:)?\s*([^)]+)\))?/;
    const patternWithoutColon = /([A-Za-z\s]+)\s+([\d.]+)\s*([^\s(]+)\s*(?:\((?:Ref:)?\s*([^)]+)\))?/;
    
    let match = line.match(patternWithColon) || line.match(patternWithoutColon);
    
    if (match) {
      const [_, testName, value, unit, refRange] = match;
      results[testName.trim()] = {
        value: parseFloat(value),
        unit: unit,
        refRange: refRange || 'Not provided',
        section: currentSection
      };
    }
  });
  
  return results;
};