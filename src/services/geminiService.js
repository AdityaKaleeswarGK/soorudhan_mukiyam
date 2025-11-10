import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const getGeminiAPIKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

// Validate and normalize the recipe data structure
const validateAndNormalizeRecipe = (data) => {
  const normalized = {
    title: '',
    description: '',
    ingredients: [],
    instructions: []
  };

  // Ensure title is a string
  if (data.title) {
    normalized.title = String(data.title).trim();
  }

  // Ensure description is a string
  if (data.description) {
    normalized.description = String(data.description).trim();
  }

  // Normalize ingredients array
  if (Array.isArray(data.ingredients)) {
    normalized.ingredients = data.ingredients.map(ing => {
      // Handle both object and string formats
      if (typeof ing === 'string') {
        return { name: ing.trim(), amount: undefined };
      }
      return {
        name: String(ing.name || ing).trim(),
        amount: ing.amount ? String(ing.amount).trim() : undefined
      };
    }).filter(ing => ing.name); // Remove empty ingredients
  }

  // Normalize instructions array
  if (Array.isArray(data.instructions)) {
    normalized.instructions = data.instructions.map(inst => {
      // Handle both object and string formats
      if (typeof inst === 'string') {
        return {
          step: inst.trim(),
          time: undefined,
          ingredientsUsed: []
        };
      }
      return {
        step: String(inst.step || inst).trim(),
        time: inst.time ? String(inst.time).trim() : undefined,
        ingredientsUsed: Array.isArray(inst.ingredientsUsed) 
          ? inst.ingredientsUsed.map(i => String(i).trim()).filter(i => i)
          : []
      };
    }).filter(inst => inst.step); // Remove empty instructions
  }

  return normalized;
};

export const formatRecipeWithGemini = async (transcribedText) => {
  try {
    const apiKey = getGeminiAPIKey();
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file');
    }

    if (!transcribedText || !transcribedText.trim()) {
      throw new Error('No transcription text provided');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-2.0-flash-exp (latest experimental flash model)
    // If this model is not available, change to 'gemini-1.5-flash'
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are a recipe parser. Parse the following recipe transcription into a structured JSON format.

IMPORTANT RULES:
1. Extract the recipe title (required)
2. Extract description if mentioned (optional)
3. Extract ALL ingredients with their amounts/quantities if mentioned
4. Extract ALL instruction steps with timings if mentioned
5. Return ONLY valid JSON, no markdown, no code blocks, no explanations

Required JSON format (exactly):
{
  "title": "Recipe Name Here",
  "description": "Optional description or empty string",
  "ingredients": [
    {"name": "ingredient name", "amount": "amount if mentioned or omit this field"},
    {"name": "flour", "amount": "2 cups"},
    {"name": "salt", "amount": ""}
  ],
  "instructions": [
    {
      "step": "instruction text",
      "time": "time if mentioned or omit this field",
      "ingredientsUsed": ["ingredient names used in this step or empty array"]
    }
  ]
}

CRITICAL: 
- Return ONLY the JSON object, nothing else
- Ensure all strings are properly escaped
- Use empty string "" for optional fields that are not mentioned
- Omit the "amount" field entirely if not mentioned (don't use null or empty string)
- Omit the "time" field entirely if not mentioned
- ingredientsUsed can be empty array [] if not specified

Recipe transcription:
"${transcribedText.trim()}"

Return ONLY the JSON:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response - remove markdown code blocks if present
    text = text.trim();
    
    // Remove markdown code block markers
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', text);
      throw new Error('Invalid JSON format from Gemini: ' + parseError.message);
    }

    // Validate and normalize the parsed data
    const normalized = validateAndNormalizeRecipe(parsed);

    // Final validation
    if (!normalized.title) {
      throw new Error('Recipe title is required but was not found');
    }

    if (normalized.ingredients.length === 0) {
      throw new Error('At least one ingredient is required');
    }

    if (normalized.instructions.length === 0) {
      throw new Error('At least one instruction is required');
    }

    return normalized;
  } catch (error) {
    console.error('Error formatting recipe with Gemini:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('API key')) {
      throw new Error('Gemini API key is missing or invalid. Please check your .env file.');
    } else if (error.message.includes('JSON')) {
      throw new Error('Failed to parse recipe format. Please try speaking more clearly or use typing mode.');
    } else if (error.message.includes('required')) {
      throw new Error('Recipe is missing required information. Please include title, ingredients, and instructions.');
    }
    
    throw error;
  }
};

