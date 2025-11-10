// API service for Spoonacular API calls
const API_KEY = 'e857339fd24f499b83d45f4580d4e780';
const BASE_URL = 'https://api.spoonacular.com';

export const searchRecipes = async (params) => {
  const queryParams = new URLSearchParams({
    apiKey: API_KEY,
  });

  if (params.cuisine) {
    queryParams.append('cuisine', params.cuisine);
  }

  if (params.maxCalories && !isNaN(params.maxCalories) && params.maxCalories !== '') {
    queryParams.append('maxCalories', params.maxCalories);
  }

  if (params.diet && params.diet !== 'None' && params.diet !== '') {
    queryParams.append('diet', params.diet);
  }

  if (params.intolerance && params.intolerance !== 'None' && params.intolerance !== '') {
    queryParams.append('intolerances', params.intolerance);
  }

  const url = `${BASE_URL}/recipes/complexSearch?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
};

export const getRecipeInformation = async (recipeId) => {
  const url = `${BASE_URL}/recipes/${recipeId}/information?apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch recipe information');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipe information:', error);
    throw error;
  }
};

export const getRecipeInstructions = async (recipeId) => {
  const url = `${BASE_URL}/recipes/${recipeId}/analyzedInstructions?apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch recipe instructions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipe instructions:', error);
    throw error;
  }
};

