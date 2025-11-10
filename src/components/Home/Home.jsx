import React from 'react';
import { useRecipes } from '../../context/RecipeContext';
import { useAuth } from '../../context/AuthContext';
import CreateArea from '../../CreateArea';
import RecipeDisplay from '../../RecipeDisplay';

export default function Home() {
    const { recipes, addRecipe } = useRecipes();
    const { user, login } = useAuth();

    if (!user) {
        return (
            <div>
                <div className="app-header">
                    <h1>🍳 RecipeHub</h1>
                    <p>Your personal recipe collection</p>
                </div>
                <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <h2>Welcome to RecipeHub!</h2>
                    <p style={{ fontSize: '1.1rem', marginBottom: '30px', color: '#666' }}>
                        Please sign in with Google to start creating and managing your recipes.
                    </p>
                    <button 
                        onClick={login}
                        style={{
                            background: '#4285F4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '15px 30px',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 16px rgba(66, 133, 244, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(66, 133, 244, 0.3)';
                        }}
                    >
                        Sign in with Google
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="app-header">
                <h1>🍳 RecipeHub</h1>
                <p>Your personal recipe collection</p>
            </div>
            <CreateArea addRecipe={addRecipe} />
            {recipes.length === 0 ? (
                <div className="empty-state">
                    <h3>No recipes yet!</h3>
                    <p>Click the "Add" button above to create your first recipe.</p>
                </div>
            ) : (
                <div className="recipe-container">
                    {recipes.map((recipe) => (
                        <RecipeDisplay key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            )}
        </div>
    );
}

