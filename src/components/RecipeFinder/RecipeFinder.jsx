import React, { useState } from 'react';
import SearchForm from './SearchForm';
import DishList from './DishList';
import { searchRecipes } from '../../services/spoonacularApi';
import './RecipeFinder.css';

export default function RecipeFinder() {
  const [dishes, setDishes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (searchParams) => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchRecipes(searchParams);
      setDishes(results);
    } catch (err) {
      setError('Failed to search recipes. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipe-finder-container">
      <div className="app-header">
        <h1>🔍 Recipe Finder</h1>
        <p>Discover new recipes using the Spoonacular API</p>
      </div>
      <SearchForm onSearch={handleSearch} />
      {loading && (
        <div className="loading-state">
          <p>Searching for recipes...</p>
        </div>
      )}
      {error && (
        <div className="error-state">
          <p>{error}</p>
        </div>
      )}
      {dishes && !loading && <DishList dishes={dishes} />}
    </div>
  );
}

