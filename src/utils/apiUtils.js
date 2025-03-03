// src/utils/apiUtils.js

// Check if we should use mock data (for testing or when APIs are unavailable)
export const shouldUseMockData = () => {
    return process.env.REACT_APP_USE_MOCK_DATA === 'true';
  };
  
  // Generate mock OCR results for testing
  export const getMockOcrResults = () => {
    return {
      success: true,
      text: "COMPLETE BLOOD COUNT\n" +
            "Hemoglobin: 14.2 g/dL (Ref: 13.5-17.5)\n" +
            "WBC: 6.8 thousand/μL (Ref: 4.5-11.0)\n" +
            "Platelets: 250 thousand/μL (Ref: 150-450)\n" +
            "METABOLIC PANEL\n" +
            "Glucose: 95 mg/dL (Ref: 70-99)\n" +
            "Cholesterol: 180 mg/dL (Ref: <200)\n" +
            "HDL: 55 mg/dL (Ref: >40)\n" +
            "LDL: 110 mg/dL (Ref: <130)"
    };
  };
  
  // Check if all required API keys are configured
  export const areApisConfigured = () => {
    const requiredKeys = [
      'REACT_APP_GOOGLE_CLOUD_API_KEY',
      'REACT_APP_OPENAI_API_KEY'
    ];
    
    return requiredKeys.every(key => 
      process.env[key] && process.env[key] !== 'your-api-key-here'
    );
  };
  
  // Log API errors with structured information
  export const logApiError = (apiName, error, context = {}) => {
    console.error(`API Error (${apiName}):`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      context
    });
    
    // In a production app, you might want to send this to a logging service
  };