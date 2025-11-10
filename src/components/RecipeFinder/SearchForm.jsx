import React, { useState } from 'react';
import { FloatingLabel, Form } from 'react-bootstrap';
import './RecipeFinder.css';

export default function SearchForm({ onSearch }) {
  const [cuisine, setCuisine] = useState('');
  const [maxCalories, setMaxCalories] = useState('');
  const [diet, setDiet] = useState('');
  const [intolerance, setIntolerance] = useState('');

  const handleSearchClick = () => {
    onSearch({
      cuisine,
      maxCalories,
      diet,
      intolerance
    });
  };

  return (
    <div className="search-form-container">
      <h2 className="search-form-title">Find Recipes</h2>
      <p className="search-form-subtitle">Search for recipes using filters</p>
      
      <div className="search-form-fields">
        <FloatingLabel
          controlId="floatingInputCuisine"
          label="Cuisine"
          className="search-form-field"
        >
          <Form.Control 
            type="text" 
            placeholder="Enter Type of Cuisine" 
            value={cuisine} 
            onChange={(e) => setCuisine(e.target.value)} 
          />
        </FloatingLabel>

        <FloatingLabel 
          controlId="floatingSelectDiet" 
          label="Diet" 
          className="search-form-field"
        >
          <Form.Select 
            aria-label="Select diet" 
            value={diet} 
            onChange={(e) => setDiet(e.target.value)}
          >
            <option>Choose your diet</option>
            <option value="None">Anything is good to go!!</option>
            <option value="gluten free">Gluten Free</option>
            <option value="ketogenic">Ketogenic</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="lacto-vegetarian">Lacto-Vegetarian</option>
            <option value="ovo-vegetarian">Ovo-Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="pescetarian">Pescetarian</option>
            <option value="paleo">Paleo</option>
            <option value="primal">Primal</option>
            <option value="low fodmap">Low FODMAP</option>
            <option value="whole30">Whole 30</option>
          </Form.Select>
        </FloatingLabel>

        <FloatingLabel 
          controlId="floatingSelectIntolerance" 
          label="Intolerance" 
          className="search-form-field"
        >
          <Form.Select 
            aria-label="Select intolerance" 
            value={intolerance} 
            onChange={(e) => setIntolerance(e.target.value)}
          >
            <option>Choose the ingredient you don't prefer</option>
            <option value="None">None</option>
            <option value="Dairy">Dairy</option>
            <option value="Peanut">Peanut</option>
            <option value="Soy">Soy</option>
            <option value="Egg">Egg</option>
            <option value="Seafood">Seafood</option>
            <option value="Sulfite">Sulfite</option>
            <option value="Gluten">Gluten</option>
            <option value="Sesame">Sesame</option>
            <option value="Tree Nut">Tree Nut</option>
            <option value="Grain">Grain</option>
            <option value="Shellfish">Shellfish</option>
            <option value="Wheat">Wheat</option>
          </Form.Select>
        </FloatingLabel>

        <FloatingLabel 
          controlId="floatingInputMaxCalories" 
          label="Max Calories"
          className="search-form-field"
        >
          <Form.Control
            type="number"
            placeholder="Enter max calories"
            value={maxCalories}
            onChange={(e) => setMaxCalories(e.target.value)}
          />
        </FloatingLabel>

        <button onClick={handleSearchClick} className="search-button">
          Search Recipes
        </button>
      </div>
    </div>
  );
}

