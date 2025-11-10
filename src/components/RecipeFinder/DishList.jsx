import React from 'react';
import Dish from './Dish';
import './RecipeFinder.css';

export default function DishList({ dishes }) {
  if (!dishes || !dishes.results || dishes.results.length === 0) {
    return (
      <div className="no-results">
        <h3>No recipes found</h3>
        <p>Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="dish-list-container">
      <h3 className="dish-list-title">Search Results</h3>
      <div className="dish-list-grid">
        {dishes.results.map((dish) => (
          <Dish key={dish.id} meal={dish} />
        ))}
      </div>
    </div>
  );
}

