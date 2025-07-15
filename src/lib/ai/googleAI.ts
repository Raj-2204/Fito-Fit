import { GoogleGenerativeAI } from '@google/generative-ai';

// Replace with your actual API key - consider using environment variables
const API_KEY = 'AIzaSyBVCusMb5e2FnDXEO9R9bs_K2Dos022KmY';

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateExerciseGuidance = async (exerciseName: string, exerciseDescription?: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    As a professional fitness trainer, provide comprehensive guidance for the exercise "${exerciseName}".
    ${exerciseDescription ? `Exercise description: ${exerciseDescription}` : ''}
    
    Please provide:
    1. Proper form and technique (3-4 key points)
    2. Common mistakes to avoid (2-3 points)
    3. Safety tips (2-3 points)
    4. Breathing technique
    5. Recommended sets and reps for beginners
    
    Format the response in a clear, structured way that's easy to read on mobile.
    Keep it concise but informative - around 200-250 words total.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating AI guidance:', error);
    throw new Error('Failed to generate AI guidance. Please try again.');
  }
};