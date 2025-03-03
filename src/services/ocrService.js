// src/services/ocrService.js
// This service handles text extraction from images/PDFs

export const extractTextFromImage = async (file) => {
    try {
      // In a real implementation, you would call an OCR API like Google Cloud Vision, 
      // Azure Computer Vision, or Tesseract.js
      
      // For demonstration, we'll simulate an API call
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulated API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful text extraction
      // In a real app, this would be the response from your OCR API
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
    } catch (error) {
      console.error('OCR extraction error:', error);
      return {
        success: false,
        error: 'Failed to extract text from image'
      };
    }
  };
  
  export const parseBloodTestResults = (text) => {
    // This function parses the raw OCR text into structured data
    // In a real app, you'd use regex or NLP to handle different lab report formats
    
    const results = {};
    const lines = text.split('\n');
    
    lines.forEach(line => {
      // Look for patterns like "Test: Value Unit (Ref: Range)"
      const match = line.match(/([^:]+):\s*([\d.]+)\s*([^\s(]+)\s*(?:\(Ref:\s*([^)]+)\))?/);
      
      if (match) {
        const [_, testName, value, unit, refRange] = match;
        results[testName.trim()] = {
          value: parseFloat(value),
          unit: unit,
          refRange: refRange || 'Not provided'
        };
      }
    });
    
    return results;
  };
  
  // src/services/medicalAnalysisService.js
  // This service analyzes the blood test results using medical knowledge
  
  export const analyzeBloodResults = async (parsedResults, userProfile) => {
    try {
      // In a real implementation, you would call a medical AI API like GPT-4 
      // or another specialized medical AI service
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Initialize the analysis results
      const analysis = {};
      
      // Apply basic analysis rules
      // In a real app, this would be handled by the AI service
      Object.keys(parsedResults).forEach(test => {
        const result = parsedResults[test];
        let status, interpretation;
        
        // Apply simplified analysis logic based on test type
        // This is where you would integrate with a medical AI API
        switch(test) {
          case 'Hemoglobin':
            if (userProfile.gender === 'male') {
              status = result.value < 13.5 ? 'Low' : result.value > 17.5 ? 'High' : 'Normal';
            } else {
              status = result.value < 12.0 ? 'Low' : result.value > 15.5 ? 'High' : 'Normal';
            }
            
            interpretation = status === 'Normal' 
              ? 'Your hemoglobin level is within normal range.'
              : status === 'Low'
                ? 'Low hemoglobin may indicate anemia. Common causes include iron deficiency, blood loss, or chronic diseases.'
                : 'Elevated hemoglobin may be due to dehydration, lung disease, or polycythemia.';
            break;
            
          case 'Glucose':
            status = result.value < 70 ? 'Low' : result.value > 99 ? 'High' : 'Normal';
            
            interpretation = status === 'Normal'
              ? 'Your glucose level is within normal range.'
              : status === 'Low'
                ? 'Low blood glucose (hypoglycemia) may cause fatigue, dizziness, and confusion. It can be due to medications, insulin excess, or liver disorders.'
                : result.value > 125
                  ? 'Glucose above 125 mg/dL may indicate diabetes. Consider follow-up testing and consultation with your doctor.'
                  : 'Slightly elevated glucose levels may indicate prediabetes. Lifestyle modifications are recommended.';
            break;
            
          case 'Cholesterol':
            status = result.value < 200 ? 'Normal' : result.value < 240 ? 'Borderline' : 'High';
            
            interpretation = status === 'Normal'
              ? 'Your total cholesterol is within the desirable range.'
              : status === 'Borderline'
                ? 'Your cholesterol is borderline high. Consider dietary changes and increased physical activity.'
                : 'High cholesterol increases risk for heart disease. Consult your healthcare provider about management strategies.';
            break;
            
          default:
            // Generic interpretation
            status = 'See reference';
            interpretation = `Consult with your healthcare provider about this result.`;
        }
        
        analysis[test] = {
          ...result,
          status,
          interpretation
        };
      });
      
      // Generate an overall summary
      const abnormalResults = Object.keys(analysis).filter(
        test => analysis[test].status !== 'Normal'
      );
      
      let summaryText;
      
      if (abnormalResults.length === 0) {
        summaryText = 'All tested parameters are within normal ranges. Your results look good!';
      } else {
        summaryText = `We found ${abnormalResults.length} result(s) outside the normal range. `;
        if (abnormalResults.includes('Glucose') && analysis['Glucose'].value > 125) {
          summaryText += 'Your glucose level is significantly elevated. ';
        }
        if (abnormalResults.includes('Hemoglobin') && analysis['Hemoglobin'].status === 'Low') {
          summaryText += 'Your hemoglobin is low, which may indicate anemia. ';
        }
        summaryText += 'Please consult with your healthcare provider about these findings.';
      }
      
      // Lifestyle recommendations
      let recommendations = [];
      
      if (abnormalResults.includes('Cholesterol') || abnormalResults.includes('LDL')) {
        recommendations.push(
          'Consider a heart-healthy diet rich in fruits, vegetables, whole grains, and lean proteins.',
          'Aim for regular physical activity of at least 150 minutes per week.',
          'Limit saturated and trans fats in your diet.'
        );
      }
      
      if (abnormalResults.includes('Glucose')) {
        recommendations.push(
          'Maintain a balanced diet low in refined sugars and carbohydrates.',
          'Regular physical activity helps improve insulin sensitivity.',
          'Monitor your carbohydrate intake and consider eating smaller, more frequent meals.'
        );
      }
      
      if (recommendations.length === 0) {
        recommendations.push(
          'Continue with a balanced diet and regular exercise.',
          'Schedule regular check-ups with your healthcare provider.',
          'Stay hydrated and get adequate sleep for overall health.'
        );
      }
      
      return {
        success: true,
        analysis: analysis,
        summary: summaryText,
        recommendations: recommendations
      };
      
    } catch (error) {
      console.error('Medical analysis error:', error);
      return {
        success: false,
        error: 'Failed to analyze blood test results'
      };
    }
  };
  
  // Advanced medical insights service (GPT integration)
  export const getMedicalInsights = async (parsedResults, userProfile, analysisResults) => {
    try {
      // This is where you would integrate with GPT or another medical AI
      // Format the data for the AI service
      const promptData = {
        results: parsedResults,
        profile: {
          age: userProfile.age,
          gender: userProfile.gender,
          existingConditions: userProfile.existingConditions,
          medications: userProfile.medications
        },
        analysis: analysisResults
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would send the data to an AI API
      // and get a detailed medical analysis back
      
      // For demonstration, we'll return simulated insights
      return {
        success: true,
        insights: [
          "Based on your cholesterol profile and age, your 10-year cardiovascular risk is estimated to be low.",
          "Your blood count values are consistent with good iron status and adequate red blood cell production.",
          "Given your medical history, these results don't show interactions with your current medications.",
          "Consider discussing vitamin D testing at your next appointment as deficiency is common in your demographic."
        ],
        followUpQuestions: [
          "How is your energy level throughout the day?",
          "Have you noticed any changes in your diet or exercise routine recently?",
          "Do you have a family history of diabetes or heart disease?",
          "When was your last complete physical examination?"
        ]
      };
      
    } catch (error) {
      console.error('Medical insights error:', error);
      return {
        success: false,
        error: 'Failed to generate medical insights'
      };
    }
  };