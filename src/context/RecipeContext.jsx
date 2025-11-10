import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const RecipeContext = createContext();

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
};

export const RecipeProvider = ({ children }) => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    if (user) {
      const savedRecipes = localStorage.getItem(`recipehub_recipes_${user.id}`);
      setRecipes(savedRecipes ? JSON.parse(savedRecipes) : []);
    } else {
      setRecipes([]);
    }
  }, [user]);

  useEffect(() => {
    if (user && recipes) {
      localStorage.setItem(`recipehub_recipes_${user.id}`, JSON.stringify(recipes));
    }
  }, [recipes, user]);

  const addRecipe = (newRecipe) => {
    setRecipes(prevRecipes => [...prevRecipes, { ...newRecipe, id: Date.now() }]);
  };

  const updateRecipe = (id, updatedRecipe) => {
    setRecipes(prevRecipes =>
      prevRecipes.map(recipe => recipe.id === id ? { ...updatedRecipe, id } : recipe)
    );
  };

  const deleteRecipe = (id) => {
    setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== id));
  };

  return (
    <RecipeContext.Provider value={{ recipes, addRecipe, updateRecipe, deleteRecipe }}>
      {children}
    </RecipeContext.Provider>
  );
};
