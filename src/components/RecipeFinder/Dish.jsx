import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { getRecipeInformation, getRecipeInstructions } from '../../services/spoonacularApi';
import { useRecipes } from '../../context/RecipeContext';
import './RecipeFinder.css';

export default function Dish({ meal }) {
  const [showModal, setShowModal] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [recipeInfo, setRecipeInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addRecipe } = useRecipes();

  const handleRecipeClick = async () => {
    setLoading(true);
    try {
      const [recipeData, recipeInstructions] = await Promise.all([
        getRecipeInformation(meal.id),
        getRecipeInstructions(meal.id)
      ]);

      setRecipeInfo(recipeData);
      setIngredients(recipeData.extendedIngredients || []);
      
      if (recipeInstructions.length > 0 && recipeInstructions[0].steps.length > 0) {
        setInstructions(recipeInstructions[0].steps);
      } else {
        setInstructions([{ step: 'Instructions not available' }]);
      }
      
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      alert('Failed to load recipe details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = () => {
    if (!recipeInfo) return;

    setSaving(true);
    try {
      // Format ingredients as strings
      const formattedIngredients = ingredients.map(ing => 
        `${ing.name}: ${ing.amount} ${ing.unit || ''}`.trim()
      );

      // Format instructions as strings
      const formattedInstructions = instructions.map(step => step.step);

      // Create recipe object matching the structure expected by Home
      const recipeToSave = {
        title: recipeInfo.title || meal.title,
        description: recipeInfo.summary 
          ? recipeInfo.summary.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
          : `A delicious ${recipeInfo.cuisines?.[0] || 'recipe'} recipe.`,
        ingredients: formattedIngredients,
        instructions: formattedInstructions,
        cuisine: recipeInfo.cuisines?.[0] || meal.cuisine || 'Unknown',
        image: recipeInfo.image || meal.image,
        servings: recipeInfo.servings,
        readyInMinutes: recipeInfo.readyInMinutes
      };

      addRecipe(recipeToSave);
      alert('Recipe saved successfully!');
      setSaving(false);
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIngredients([]);
    setInstructions([]);
    setRecipeInfo(null);
  };

  return (
    <div className="dish-card">
      <div className="dish-card-content">
        <h3 className="dish-title">{meal.title}</h3>
        {meal.image && (
          <img src={meal.image} alt={meal.title} className="dish-image" />
        )}
      </div>
      <div className="dish-card-button-wrapper">
        <button 
          onClick={handleRecipeClick} 
          className="get-recipe-button"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Recipe'}
        </button>
      </div>
      
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>{meal.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          {recipeInfo && (
            <div className="recipe-meta-info">
              {recipeInfo.cuisines && recipeInfo.cuisines.length > 0 && (
                <p className="recipe-cuisine"><strong>Cuisine:</strong> {recipeInfo.cuisines.join(', ')}</p>
              )}
              {recipeInfo.servings && (
                <p className="recipe-servings"><strong>Servings:</strong> {recipeInfo.servings}</p>
              )}
              {recipeInfo.readyInMinutes && (
                <p className="recipe-time"><strong>Ready in:</strong> {recipeInfo.readyInMinutes} minutes</p>
              )}
            </div>
          )}
          <h4>Ingredients:</h4>
          <ol className="recipe-ingredients-list">
            {ingredients.map((ingredient, index) => (
              <li key={index}>
                {ingredient.name}: {ingredient.amount} {ingredient.unit || ''}
              </li>
            ))}
          </ol>
          <h4>Instructions:</h4>
          <ol className="recipe-instructions-list">
            {instructions.map((step, index) => (
              <li key={index}>{step.step}</li>
            ))}
          </ol>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <button 
            onClick={handleSaveRecipe} 
            className="save-recipe-button"
            disabled={saving || !recipeInfo}
          >
            {saving ? 'Saving...' : 'Save Recipe'}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

