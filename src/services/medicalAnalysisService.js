// src/services/medicalAnalysisService.js
import axios from 'axios';

// Analyze blood test results using medical AI
export const analyzeBloodResults = async (parsedResults, userProfile) => {
  try {
    // First, perform basic local analysis
    const basicAnalysis = performBasicAnalysis(parsedResults, userProfile);
    
    // Then, enhance with AI-powered analysis
    const enhancedAnalysis = await enhanceWithAI(parsedResults, userProfile, basicAnalysis);
    
    return {
      success: true,
      analysis: enhancedAnalysis.analysis,
      summary: enhancedAnalysis.summary,
      recommendations: enhancedAnalysis.recommendations
    };
  } catch (error) {
    console.error('Medical analysis error:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze blood test results'
    };
  }
};

// Perform basic analysis rules locally
function performBasicAnalysis(parsedResults, userProfile) {
  const analysis = {};
  
  // Apply basic analysis rules based on reference ranges
  Object.keys(parsedResults).forEach(test => {
    const result = parsedResults[test];
    let status, interpretation;
    
    // Parse reference range to determine status
    if (result.refRange && result.refRange !== 'Not provided') {
      // Handle different reference range formats
      let min, max;
      
      if (result.refRange.includes('-')) {
        // Format: "13.5-17.5"
        [min, max] = result.refRange.split('-').map(val => parseFloat(val));
      } else if (result.refRange.includes('<')) {
        // Format: "<200"
        max = parseFloat(result.refRange.replace('<', ''));
      } else if (result.refRange.includes('>')) {
        // Format: ">40"
        min = parseFloat(result.refRange.replace('>', ''));
      }
      
      // Determine status based on reference range
      if (min !== undefined && max !== undefined) {
        status = result.value < min ? 'Low' : result.value > max ? 'High' : 'Normal';
      } else if (min !== undefined) {
        status = result.value < min ? 'Low' : 'Normal';
      } else if (max !== undefined) {
        status = result.value > max ? 'High' : 'Normal';
      } else {
        status = 'Unknown';
      }
    } else {
      status = 'Unknown';
    }
    
    // Basic interpretations
    switch (test) {
      case 'Hemoglobin':
        interpretation = status === 'Normal' 
          ? 'Your hemoglobin level is within normal range.'
          : status === 'Low'
            ? 'Low hemoglobin may indicate anemia. Common causes include iron deficiency, blood loss, or chronic diseases.'
            : 'Elevated hemoglobin may be due to dehydration, lung disease, or polycythemia.';
        break;
      
      case 'Glucose':
        interpretation = status === 'Normal'
          ? 'Your glucose level is within normal range.'
          : status === 'Low'
            ? 'Low blood glucose (hypoglycemia) may cause fatigue, dizziness, and confusion.'
            : result.value > 125
              ? 'Glucose above 125 mg/dL may indicate diabetes.'
              : 'Slightly elevated glucose levels may indicate prediabetes.';
        break;
      
      default:
        interpretation = status === 'Normal'
          ? `Your ${test} level is within normal range.`
          : status === 'Low'
            ? `Your ${test} level is below the reference range.`
            : `Your ${test} level is above the reference range.`;
    }
    
    analysis[test] = {
      ...result,
      status,
      interpretation
    };
  });
  
  return analysis;
}

// Enhance analysis with AI API (using OpenAI or similar)
async function enhanceWithAI(parsedResults, userProfile, basicAnalysis) {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const apiEndpoint = 'https://api.openai.com/v1/chat/completions';
  
  // Prepare data for the analysis prompt
  const prompt = buildMedicalAnalysisPrompt(parsedResults, userProfile, basicAnalysis);
  
  // Call OpenAI API
  const response = await axios.post(
    apiEndpoint,
    {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a medical analysis assistant specialized in blood test interpretation. Provide factual medical information based on the provided data. Always note that your analysis is not a substitute for professional medical advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more factual responses
      max_tokens: 1000
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  // Parse the AI response
  try {
    const aiResponse = response.data.choices[0].message.content;
    return parseAIResponse(aiResponse, basicAnalysis);
  } catch (error) {
    console.error('Error parsing AI response:', error);
    // If AI enhancement fails, return the basic analysis
    return {
      analysis: basicAnalysis,
      summary: generateBasicSummary(basicAnalysis),
      recommendations: generateBasicRecommendations(basicAnalysis)
    };
  }
}

// Build prompt for the medical AI
function buildMedicalAnalysisPrompt(parsedResults, userProfile, basicAnalysis) {
  // Convert results to formatted string for the prompt
  const resultsText = Object.keys(parsedResults).map(test => {
    const result = parsedResults[test];
    return `${test}: ${result.value} ${result.unit} (Reference Range: ${result.refRange})`;
  }).join('\n');
  
  // Build a complete prompt with user context and specific requests
  return `
    Please analyze the following blood test results for a ${userProfile.age}-year-old ${userProfile.gender} patient:
    
    MEDICAL HISTORY:
    ${userProfile.existingConditions ? `Existing conditions: ${userProfile.existingConditions}` : 'No known conditions'}
    ${userProfile.medications ? `Current medications: ${userProfile.medications}` : 'No current medications'}
    
    BLOOD TEST RESULTS:
    ${resultsText}
    
    Please provide the following in JSON format:
    1. An analysis object with detailed interpretations for each test
    2. A summary paragraph of the overall results
    3. An array of personalized recommendations based on the results
    
    Format your response as valid JSON with these keys: "analysis", "summary", "recommendations".
  `;
}

// Parse the AI response into structured data
function parseAIResponse(aiResponse, basicAnalysis) {
  try {
    // Extract JSON from AI response (may be embedded in markdown or explanatory text)
    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)```/) || 
                      aiResponse.match(/{[\s\S]*}/);
    
    const jsonContent = jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiResponse;
    const parsedResponse = JSON.parse(jsonContent);
    
    // Merge AI analysis with basic analysis
    const mergedAnalysis = { ...basicAnalysis };
    
    if (parsedResponse.analysis) {
      Object.keys(parsedResponse.analysis).forEach(test => {
        if (mergedAnalysis[test]) {
          // Enhance existing test interpretations
          mergedAnalysis[test].interpretation = parsedResponse.analysis[test].interpretation || mergedAnalysis[test].interpretation;
          mergedAnalysis[test].status = parsedResponse.analysis[test].status || mergedAnalysis[test].status;
        }
      });
    }
    
    return {
      analysis: mergedAnalysis,
      summary: parsedResponse.summary || generateBasicSummary(basicAnalysis),
      recommendations: parsedResponse.recommendations || generateBasicRecommendations(basicAnalysis)
    };
  } catch (error) {
    console.error('Error parsing AI JSON response:', error);
    return {
      analysis: basicAnalysis,
      summary: generateBasicSummary(basicAnalysis),
      recommendations: generateBasicRecommendations(basicAnalysis)
    };
  }
}

// Generate a basic summary if AI analysis fails
function generateBasicSummary(analysis) {
  const abnormalResults = Object.keys(analysis).filter(
    test => analysis[test].status !== 'Normal'
  );
  
  if (abnormalResults.length === 0) {
    return 'All tested parameters are within normal ranges. Your results look good!';
  } else {
    return `We found ${abnormalResults.length} result(s) outside the normal range. Please consult with your healthcare provider about these findings.`;
  }
}

// Generate basic recommendations if AI analysis fails
function generateBasicRecommendations(analysis) {
  const abnormalResults = Object.keys(analysis).filter(
    test => analysis[test].status !== 'Normal'
  );
  
  if (abnormalResults.length === 0) {
    return [
      'Continue with a balanced diet and regular exercise.',
      'Schedule regular check-ups with your healthcare provider.',
      'Stay hydrated and get adequate sleep for overall health.'
    ];
  } else {
    return [
      'Consult with your healthcare provider about your test results.',
      'Consider lifestyle modifications appropriate for your specific results.',
      'Follow up with additional testing if recommended by your doctor.'
    ];
  }
}

// Get advanced medical insights
export const getMedicalInsights = async (parsedResults, userProfile, analysisResults) => {
  try {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    const apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    
    // Build comprehensive prompt for insights
    const prompt = `
      Based on the following blood test results and patient profile, provide detailed medical insights and follow-up questions.
      
      PATIENT PROFILE:
      Age: ${userProfile.age}
      Gender: ${userProfile.gender}
      Existing Conditions: ${userProfile.existingConditions || 'None reported'}
      Current Medications: ${userProfile.medications || 'None reported'}
      
      BLOOD TEST RESULTS:
      ${Object.keys(parsedResults).map(test => {
        const result = parsedResults[test];
        const status = analysisResults[test] ? analysisResults[test].status : 'Unknown';
        return `${test}: ${result.value} ${result.unit} (Reference: ${result.refRange}) - Status: ${status}`;
      }).join('\n')}
      
      Please provide:
      1. 4-6 detailed medical insights that consider the patient's profile and test results
      2. 3-5 relevant follow-up questions for the patient or their healthcare provider
      
      Format your response as JSON with "insights" and "followUpQuestions" arrays.
    `;
    
    // Call OpenAI API
    const response = await axios.post(
      apiEndpoint,
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a medical analysis assistant specialized in blood test interpretation. Provide factual medical information based on the provided data. Always note that your analysis is not a substitute for professional medical advice."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Parse the response
    const aiResponse = response.data.choices[0].message.content;
    
    // Extract JSON from the response
    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)```/) || 
                      aiResponse.match(/{[\s\S]*}/);
    
    const jsonContent = jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiResponse;
    const parsedResponse = JSON.parse(jsonContent);
    
    return {
      success: true,
      insights: parsedResponse.insights || [
        "Consider discussing these results with your healthcare provider for a complete interpretation.",
        "Regular monitoring of your blood values is recommended for tracking your health over time."
      ],
      followUpQuestions: parsedResponse.followUpQuestions || [
        "When was your last complete physical examination?",
        "Have you noticed any changes in your health recently?"
      ]
    };
    
  } catch (error) {
    console.error('Medical insights error:', error);
    return {
      success: true, // Return success even on error to avoid disrupting user experience
      insights: [
        "Consider discussing these results with your healthcare provider for a complete interpretation.",
        "Regular monitoring of your blood values is recommended for tracking your health over time."
      ],
      followUpQuestions: [
        "When was your last complete physical examination?",
        "Have you noticed any changes in your health recently?"
      ]
    };
  }
};