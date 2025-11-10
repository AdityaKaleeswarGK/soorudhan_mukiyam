import React, { useState, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import { speakText, stopSpeaking } from './services/speechService';
import { playAudio } from './services/audioService';
import CookingMode from './components/CookingMode/CookingMode';
import { useRecipes } from './context/RecipeContext';
import CreateArea from './CreateArea';
import './RecipeDisplay.css';

export default function RecipeDisplay({ recipe }) {
    const { updateRecipe, deleteRecipe } = useRecipes();
    const [showModal, setShowModal] = useState(false);
    const [showCookingMode, setShowCookingMode] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [speakingIndex, setSpeakingIndex] = useState(null);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const audioRef = useRef(null);

    const handleCloseModal = () => {
        setShowModal(false);
        stopSpeaking();
        setSpeakingIndex(null);
    };

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleSpeakInstruction = (instruction, index) => {
        if (speakingIndex === index) {
            // Stop speaking if already speaking this instruction
            stopSpeaking();
            setSpeakingIndex(null);
        } else {
            // Stop any current speech
            stopSpeaking();
            
            // Get instruction text
            const instructionText = typeof instruction === 'string' 
                ? instruction 
                : instruction.step || instruction;
            
            // Add timing info if available
            let textToSpeak = instructionText;
            if (typeof instruction === 'object' && instruction.time) {
                textToSpeak += `. Time required: ${instruction.time}`;
            }
            
            // Speak the instruction
            speakText(textToSpeak, () => {
                setSpeakingIndex(null);
            });
            setSpeakingIndex(index);
        }
    };

    const formatIngredientDisplay = (ingredient) => {
        if (typeof ingredient === 'string') {
            return ingredient;
        }
        return ingredient.amount 
            ? `${ingredient.name} (${ingredient.amount})`
            : ingredient.name;
    };

    const formatInstructionDisplay = (instruction) => {
        if (typeof instruction === 'string') {
            return instruction;
        }
        let display = instruction.step || instruction;
        if (instruction.time) {
            display += ` [Time: ${instruction.time}]`;
        }
        return display;
    };

    const handlePlayOriginalAudio = () => {
        if (recipe.audioRecording) {
            if (audioPlaying) {
                // Stop audio
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                }
                setAudioPlaying(false);
            } else {
                // Play audio
                audioRef.current = playAudio(recipe.audioRecording, () => {
                    setAudioPlaying(false);
                });
                setAudioPlaying(true);
            }
        }
    };

    const handleStartCookingMode = () => {
        setShowModal(false);
        setShowCookingMode(true);
    };

    const handleEdit = () => {
        setShowModal(false);
        setShowEditModal(true);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this recipe?')) {
            deleteRecipe(recipe.id);
            setShowModal(false);
        }
    };

    const handleSaveEdit = (updatedRecipe) => {
        updateRecipe(recipe.id, updatedRecipe);
        setShowEditModal(false);
    };

    return (
        <div className='container'>
            <div className="recipe-box" onClick={handleOpenModal}>
                <h3 style={{ overflowWrap: 'break-word', wordBreak: 'break-word' } }>{recipe.title}</h3>
                <p className="description">{recipe.description}</p>
            </div>
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton className="modal-header">
                    <Modal.Title>{recipe.title}</Modal.Title>
                </Modal.Header> 
                <Modal.Body style={{ padding: '25px', maxHeight: '70vh', overflowY: 'auto', background: '#FFFEF9' }}>
                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <button
                            onClick={handleStartCookingMode}
                            style={{
                                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px 24px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600',
                                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
                            }}
                        >
                            🍳 Start Cooking Mode
                        </button>
                        {recipe.audioRecording && (
                            <button
                                onClick={handlePlayOriginalAudio}
                                style={{
                                    background: audioPlaying ? '#f44336' : '#FFD60A',
                                    color: audioPlaying ? 'white' : '#2C2416',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '12px 24px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 12px rgba(255, 214, 10, 0.3)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {audioPlaying ? '⏹️ Stop Audio' : '🎤 Play Original Recording'}
                            </button>
                        )}
                        <button
                            onClick={handleEdit}
                            style={{
                                background: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px 24px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600',
                                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            ✏️ Edit Recipe
                        </button>
                        <button
                            onClick={handleDelete}
                            style={{
                                background: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px 24px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600',
                                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            🗑️ Delete Recipe
                        </button>
                    </div>
                    
                    {recipe.description && <p style={{ marginBottom: '20px', fontSize: '1.1rem', color: '#5D4E37' }}>{recipe.description}</p>}
                    {(recipe.cuisine || recipe.servings || recipe.readyInMinutes) && (
                        <div style={{ background: '#F5E6D3', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                            {recipe.cuisine && <p style={{ margin: 0, color: '#2C2416', fontSize: '0.95rem' }}><strong>Cuisine:</strong> {recipe.cuisine}</p>}
                            {recipe.servings && <p style={{ margin: 0, color: '#2C2416', fontSize: '0.95rem' }}><strong>Servings:</strong> {recipe.servings}</p>}
                            {recipe.readyInMinutes && <p style={{ margin: 0, color: '#2C2416', fontSize: '0.95rem' }}><strong>Ready in:</strong> {recipe.readyInMinutes} minutes</p>}
                        </div>
                    )}
                    <h4 style={{ color: '#2C2416', marginTop: '20px', marginBottom: '15px', fontWeight: '600' }}>Ingredients:</h4>
                    <ol>
                        {recipe.ingredients.map((ingredient, index) => (
                            <li key={index} style={{ marginBottom: '10px', lineHeight: '1.6' }}>
                                {formatIngredientDisplay(ingredient)}
                            </li>
                        ))}
                    </ol>
                    <h4 style={{ color: '#2C2416', marginTop: '25px', marginBottom: '15px', fontWeight: '600' }}>Instructions:</h4>
                    <ol>
                        {recipe.instructions.map((instruction, index) => {
                            const instructionText = formatInstructionDisplay(instruction);
                            const isSpeaking = speakingIndex === index;
                            
                            return (
                                <li 
                                    key={index} 
                                    style={{ 
                                        marginBottom: '15px', 
                                        lineHeight: '1.6',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '10px'
                                    }}
                                >
                                    <span style={{ flex: 1 }}>{instructionText}</span>
                                    <button
                                        onClick={() => handleSpeakInstruction(instruction, index)}
                                        style={{
                                            background: isSpeaking ? '#f44336' : '#FFD60A',
                                            color: isSpeaking ? 'white' : '#2C2416',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '6px 12px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            whiteSpace: 'nowrap',
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                        onMouseOver={(e) => {
                                            if (!isSpeaking) {
                                                e.target.style.background = '#FFCC00';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (!isSpeaking) {
                                                e.target.style.background = '#FFD60A';
                                            }
                                        }}
                                    >
                                        {isSpeaking ? '⏹️ Stop' : '🔊 Listen'}
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                </Modal.Body>
            </Modal>
            <CookingMode 
                recipe={recipe} 
                show={showCookingMode} 
                onClose={() => setShowCookingMode(false)} 
            />
            {showEditModal && (
                <CreateArea 
                    addRecipe={handleSaveEdit} 
                    editRecipe={recipe}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </div>
    );
}
