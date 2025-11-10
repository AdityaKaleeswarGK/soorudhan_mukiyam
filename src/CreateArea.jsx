import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { SpeechRecognitionService } from './services/speechService';
import { AudioRecorderService } from './services/audioService';
import { formatRecipeWithGemini } from './services/geminiService';
import './CreateArea.css';

export default function CreateArea({ addRecipe, editRecipe, onClose }) {
    const [showModeModal, setShowModeModal] = useState(false);
    const [showRecipeModal, setShowRecipeModal] = useState(false);
    const [mode, setMode] = useState(null); // 'type' or 'speak'
    const [recipe, setRecipe] = useState(() => {
        if (editRecipe) {
            return {
                title: editRecipe.title || '',
                description: editRecipe.description || '',
                ingredients: editRecipe.ingredients || [],
                instructions: editRecipe.instructions || []
            };
        }
        return {
            title: '',
            description: '',
            ingredients: [],
            instructions: []
        };
    });
    const [ingredientInput, setIngredientInput] = useState('');
    const [ingredientAmount, setIngredientAmount] = useState('');
    const [instructionInput, setInstructionInput] = useState('');
    const [instructionTime, setInstructionTime] = useState('');
    const [editIndex, setEditIndex] = useState(null);
    const [editType, setEditType] = useState(null);
    
    // Speech recognition state
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [finalTranscript, setFinalTranscript] = useState('');
    const [accumulatedTranscript, setAccumulatedTranscript] = useState(''); // All final text accumulated
    const [isEditingTranscript, setIsEditingTranscript] = useState(false);
    const [editedTranscript, setEditedTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [waveformHeights, setWaveformHeights] = useState([]);
    const [audioRecording, setAudioRecording] = useState(null); // Base64 audio string
    const speechRecognitionRef = useRef(null);
    const waveformIntervalRef = useRef(null);
    const audioRecorderRef = useRef(null);

    useEffect(() => {
        // Initialize speech recognition only if supported
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            try {
                speechRecognitionRef.current = new SpeechRecognitionService();
            } catch (error) {
                console.error('Speech recognition initialization error:', error);
            }
        }

        return () => {
            if (speechRecognitionRef.current) {
                speechRecognitionRef.current.stopListening();
            }
            if (waveformIntervalRef.current) {
                clearInterval(waveformIntervalRef.current);
            }
            if (audioRecorderRef.current) {
                // Cleanup audio recorder if needed
            }
        };
    }, []);

    // Update transcript display when accumulated or interim changes
    useEffect(() => {
        const displayText = accumulatedTranscript 
            ? `${accumulatedTranscript} ${interimTranscript || ''}`.trim()
            : (interimTranscript || '');
        setTranscript(displayText);
    }, [accumulatedTranscript, interimTranscript]);

    const handleClick = () => {
        if (editRecipe) {
            // If editing, skip mode selection and go directly to recipe modal
            setMode('type');
            setShowRecipeModal(true);
        } else {
            setShowModeModal(true);
        }
    };

    useEffect(() => {
        if (editRecipe) {
            // Auto-open modal when editing
            setMode('type');
            setShowRecipeModal(true);
        }
    }, [editRecipe]);

    const handleCloseModeModal = () => {
        setShowModeModal(false);
    };

    const handleCloseRecipeModal = () => {
        setShowRecipeModal(false);
        setEditIndex(null);
        setEditType(null);
        setIsListening(false);
        if (speechRecognitionRef.current) {
            speechRecognitionRef.current.stopListening();
        }
        setTranscript('');
        setInterimTranscript('');
        setFinalTranscript('');
        setAccumulatedTranscript('');
        setEditedTranscript('');
        setIsEditingTranscript(false);
        setAudioRecording(null);
        if (waveformIntervalRef.current) {
            clearInterval(waveformIntervalRef.current);
        }
        setWaveformHeights([]);
    };

    const handleSelectMode = (selectedMode) => {
        setMode(selectedMode);
        setShowModeModal(false);
        setShowRecipeModal(true);
        // Reset recipe state
        setRecipe({
            title: '',
            description: '',
            ingredients: [],
            instructions: []
        });
    };

    const handleAddIngredient = () => {
        if (ingredientInput.trim() !== '') {
            const ingredientObj = {
                name: ingredientInput.trim(),
                amount: ingredientAmount.trim() || undefined
            };
            
            if (editType === 'ingredient' && editIndex !== null) {
                const updatedIngredients = [...recipe.ingredients];
                updatedIngredients[editIndex] = ingredientObj;
                setRecipe(prevState => ({
                    ...prevState,
                    ingredients: updatedIngredients
                }));
            } else {
                setRecipe(prevState => ({
                    ...prevState,
                    ingredients: [...prevState.ingredients, ingredientObj]
                }));
            }
            setIngredientInput('');
            setIngredientAmount('');
            setEditIndex(null);
            setEditType(null);
        }
    };

    const handleAddInstruction = () => {
        if (instructionInput.trim() !== '') {
            const instructionObj = {
                step: instructionInput.trim(),
                time: instructionTime.trim() || undefined,
                ingredientsUsed: []
            };
            
            if (editType === 'instruction' && editIndex !== null) {
                const updatedInstructions = [...recipe.instructions];
                updatedInstructions[editIndex] = instructionObj;
                setRecipe(prevState => ({
                    ...prevState,
                    instructions: updatedInstructions
                }));
            } else {
                setRecipe(prevState => ({
                    ...prevState,
                    instructions: [...prevState.instructions, instructionObj]
                }));
            }
            setInstructionInput('');
            setInstructionTime('');
            setEditIndex(null);
            setEditType(null);
        }
    };

    const handleKeyPress = (e, action) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (action === 'ingredient') {
                handleAddIngredient();
            } else if (action === 'instruction') {
                handleAddInstruction();
            }
        }
    };

    const handleEdit = (index, type) => {
        setEditIndex(index);
        setEditType(type);
        if (type === 'ingredient') {
            const ing = recipe.ingredients[index];
            setIngredientInput(ing.name || ing);
            setIngredientAmount(ing.amount || '');
        } else if (type === 'instruction') {
            const inst = recipe.instructions[index];
            setInstructionInput(inst.step || inst);
            setInstructionTime(inst.time || '');
        }
    };

    const handleStartListening = async () => {
        if (!speechRecognitionRef.current) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
                return;
            }
            alert('Speech recognition not initialized. Please refresh the page.');
            return;
        }

        setIsListening(true);
        setTranscript('');
        setInterimTranscript('');
        setFinalTranscript('');
        setEditedTranscript('');
        setIsEditingTranscript(false);
        setAudioRecording(null);
        
        // Start audio recording
        try {
            audioRecorderRef.current = new AudioRecorderService();
            await audioRecorderRef.current.startRecording();
        } catch (error) {
            console.error('Error starting audio recording:', error);
            alert('Could not start audio recording. Text will still be captured.');
        }
        
        // Initialize waveform heights
        const initialHeights = Array(20).fill(0).map(() => Math.random() * 40 + 20);
        setWaveformHeights(initialHeights);
        
        // Animate waveform while listening
        waveformIntervalRef.current = setInterval(() => {
            setWaveformHeights(prev => prev.map(() => Math.random() * 40 + 20));
        }, 150);

        speechRecognitionRef.current.startListening(
            (result) => {
                // Update interim transcript
                setInterimTranscript(result.interim || '');
                
                // Accumulate final transcripts - append new final text to existing accumulated text
                if (result.final) {
                    setAccumulatedTranscript(prev => {
                        return prev ? `${prev} ${result.final}`.trim() : result.final;
                    });
                    setFinalTranscript(result.final);
                }
            },
            (error) => {
                console.error('Speech recognition error:', error);
                setIsListening(false);
                if (error === 'no-speech') {
                    alert('No speech detected. Please try again.');
                } else if (error === 'not-allowed') {
                    alert('Microphone access denied. Please allow microphone access and try again.');
                } else {
                    alert('Error with speech recognition: ' + error);
                }
            },
            () => {
                setIsListening(false);
                if (waveformIntervalRef.current) {
                    clearInterval(waveformIntervalRef.current);
                }
            }
        );
    };

    const handleStopListening = async () => {
        if (speechRecognitionRef.current) {
            speechRecognitionRef.current.stopListening();
        }
        setIsListening(false);
        if (waveformIntervalRef.current) {
            clearInterval(waveformIntervalRef.current);
        }
        
        // Stop audio recording and save
        if (audioRecorderRef.current) {
            try {
                const audioBase64 = await audioRecorderRef.current.stopRecording();
                setAudioRecording(audioBase64);
            } catch (error) {
                console.error('Error stopping audio recording:', error);
            }
        }
        
        // Set edited transcript to accumulated transcript for editing
        const textToEdit = accumulatedTranscript || transcript;
        if (textToEdit.trim()) {
            setEditedTranscript(textToEdit.trim());
            setIsEditingTranscript(true);
        }
    };

    const handleSaveEditedTranscript = async () => {
        const textToProcess = editedTranscript.trim();
        if (!textToProcess) {
            alert('Please enter some text to process.');
            return;
        }
        
        setIsEditingTranscript(false);
        setIsProcessing(true);
        
        try {
            // Format recipe with Gemini using edited transcript
            const formattedRecipe = await formatRecipeWithGemini(textToProcess);
            
            // Add audio recording to recipe
            const recipeWithAudio = {
                ...formattedRecipe,
                audioRecording: audioRecording // Save the original audio recording
            };
            
            // The formattedRecipe is already in the correct format, use it directly
            setRecipe(recipeWithAudio);
            setTranscript('');
            setInterimTranscript('');
            setFinalTranscript('');
            setAccumulatedTranscript('');
            setEditedTranscript('');
            setAudioRecording(null);
        } catch (error) {
            console.error('Error formatting recipe:', error);
            const errorMessage = error.message || 'Error formatting recipe. Please try again or use typing mode.';
            alert(errorMessage);
            setIsEditingTranscript(true); // Go back to edit mode on error
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditingTranscript(false);
        setEditedTranscript('');
    };

    const handleAddRecipe = () => {
        // Validation: Check if title is provided
        if (!recipe.title.trim()) {
            alert('Please enter a recipe title');
            return;
        }
        
        // Validation: Check if at least one ingredient is provided
        if (recipe.ingredients.length === 0) {
            alert('Please add at least one ingredient');
            return;
        }
        
        // Validation: Check if at least one instruction is provided
        if (recipe.instructions.length === 0) {
            alert('Please add at least one instruction');
            return;
        }
        
        // Preserve audio recording if editing
        const recipeToSave = editRecipe && editRecipe.audioRecording 
            ? { ...recipe, audioRecording: editRecipe.audioRecording }
            : recipe;
        
        addRecipe(recipeToSave); 
        handleCloseRecipeModal();
        if (onClose) {
            onClose();
        }
        // Reset only if not editing
        if (!editRecipe) {
            setRecipe({
                title: '',
                description: '',
                ingredients: [],
                instructions: []
            });
            setIngredientInput('');
            setIngredientAmount('');
            setInstructionInput('');
            setInstructionTime('');
            setMode(null);
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

    return (
        <div>
            {!editRecipe && (
                <div className="basepage-container">
                    <div className="basepage">
                        <h2>Add a new Recipe</h2>
                        <button onClick={handleClick} className="add-button">Add</button>
                    </div>
                </div>
            )}

            {/* Mode Selection Modal */}
            <Modal show={showModeModal} onHide={handleCloseModeModal} className="custom-modal" centered>
                <Modal.Header closeButton className="modal-header">
                    <Modal.Title className="modal-title">Choose Input Method</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button 
                            onClick={() => handleSelectMode('type')} 
                            className="mode-button"
                            style={{
                                padding: '30px 40px',
                                fontSize: '1.2rem',
                                background: '#FFD60A',
                                color: '#2C2416',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                boxShadow: '0 4px 12px rgba(255, 214, 10, 0.35)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            ⌨️ Type Recipe
                        </button>
                        <button 
                            onClick={() => handleSelectMode('speak')} 
                            className="mode-button"
                            style={{
                                padding: '30px 40px',
                                fontSize: '1.2rem',
                                background: '#FFD60A',
                                color: '#2C2416',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                boxShadow: '0 4px 12px rgba(255, 214, 10, 0.35)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            🎤 Speak Recipe
                        </button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Recipe Input Modal */}
            <Modal show={showRecipeModal} onHide={handleCloseRecipeModal} className="custom-modal" size="lg">
                <Modal.Header closeButton className="modal-header">
                    <Modal.Title className="modal-title">
                        {editRecipe ? 'Edit Recipe' : (mode === 'speak' ? 'Speak Recipe' : 'Add Recipe')}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body">
                    {mode === 'speak' ? (
                        <div className="speech-section">
                            <div style={{ marginBottom: '20px' }}>
                                <h4>Record Your Recipe</h4>
                                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>
                                    Click "Start Recording" and speak your recipe. Include ingredients with amounts and instructions with timings. After processing, you can edit the generated content.
                                </p>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                    <button 
                                        onClick={handleStartListening}
                                        disabled={isListening || isProcessing}
                                        className="bind"
                                        style={{
                                            background: isListening ? '#4CAF50' : '#FFD60A',
                                            color: '#2C2416',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {isListening ? '🔴 Recording...' : '🎤 Start Recording'}
                                    </button>
                                    {isListening && (
                                        <button 
                                            onClick={handleStopListening}
                                            className="bind"
                                            style={{
                                                background: '#f44336',
                                                color: 'white',
                                                fontWeight: '600'
                                            }}
                                        >
                                            ⏹️ Stop & Process
                                        </button>
                                    )}
                                </div>
                                {/* Waveform Animation */}
                                {isListening && (
                                    <div className="waveform-container" style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: '20px',
                                        marginBottom: '20px',
                                        background: 'linear-gradient(135deg, #FFF9C4 0%, #FFE5B4 100%)',
                                        borderRadius: '12px',
                                        minHeight: '80px'
                                    }}>
                                        <div className="waveform">
                                            {waveformHeights.length > 0 ? (
                                                waveformHeights.map((height, i) => (
                                                    <div
                                                        key={i}
                                                        className="waveform-bar"
                                                        style={{
                                                            width: '4px',
                                                            height: `${height}px`,
                                                            background: 'linear-gradient(180deg, #4CAF50 0%, #81C784 100%)',
                                                            margin: '0 2px',
                                                            borderRadius: '2px',
                                                            transition: 'height 0.15s ease',
                                                            animation: `waveform-animation ${0.5 + (i % 3) * 0.2}s ease-in-out infinite`,
                                                            animationDelay: `${i * 0.05}s`
                                                        }}
                                                    />
                                                ))
                                            ) : (
                                                Array(20).fill(0).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="waveform-bar"
                                                        style={{
                                                            width: '4px',
                                                            height: '30px',
                                                            background: 'linear-gradient(180deg, #4CAF50 0%, #81C784 100%)',
                                                            margin: '0 2px',
                                                            borderRadius: '2px',
                                                            animation: `waveform-animation ${0.5 + (i % 3) * 0.2}s ease-in-out infinite`,
                                                            animationDelay: `${i * 0.05}s`
                                                        }}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Edit Transcript Section */}
                                {isEditingTranscript && (
                                    <div style={{ 
                                        padding: '20px', 
                                        background: '#FFF9C4', 
                                        borderRadius: '12px',
                                        marginBottom: '20px',
                                        border: '2px solid #FFD60A'
                                    }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between',
                                            marginBottom: '15px'
                                        }}>
                                            <h5 style={{ margin: 0, color: '#2C2416', fontWeight: '600' }}>
                                                ✏️ Edit Your Transcript
                                            </h5>
                                        </div>
                                        <textarea
                                            value={editedTranscript}
                                            onChange={(e) => setEditedTranscript(e.target.value)}
                                            style={{
                                                width: '100%',
                                                minHeight: '150px',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '2px solid #E8DCC6',
                                                fontSize: '0.95rem',
                                                lineHeight: '1.6',
                                                fontFamily: 'inherit',
                                                resize: 'vertical'
                                            }}
                                            placeholder="Edit your recipe transcription here..."
                                        />
                                        <div style={{ 
                                            display: 'flex', 
                                            gap: '10px', 
                                            marginTop: '15px',
                                            justifyContent: 'flex-end'
                                        }}>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="bind"
                                                style={{
                                                    background: '#999',
                                                    color: 'white'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveEditedTranscript}
                                                disabled={!editedTranscript.trim() || isProcessing}
                                                className="bind"
                                                style={{
                                                    background: '#4CAF50',
                                                    color: 'white',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                ✓ Process with AI
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Real-time Transcript Display - Show complete accumulated text */}
                                {!isEditingTranscript && (accumulatedTranscript || interimTranscript || isListening) && (
                                    <div style={{ 
                                        padding: '20px', 
                                        background: '#F8F9FA', 
                                        borderRadius: '12px',
                                        marginBottom: '15px',
                                        border: '2px solid #E9ECEF',
                                        minHeight: '120px',
                                        maxHeight: '300px',
                                        overflowY: 'auto'
                                    }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between',
                                            marginBottom: '10px'
                                        }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                color: '#666',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}>
                                                <span style={{ marginRight: '8px' }}>📝</span>
                                                Complete Captured Text:
                                            </div>
                                            {isListening && (
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    color: '#4CAF50',
                                                    fontWeight: '600',
                                                    background: '#E8F5E9',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px'
                                                }}>
                                                    🔴 Recording
                                                </span>
                                            )}
                                        </div>
                                        {accumulatedTranscript && (
                                            <p style={{ 
                                                margin: '0 0 8px 0', 
                                                color: '#2C2416', 
                                                fontSize: '0.95rem',
                                                lineHeight: '1.6',
                                                fontWeight: '500',
                                                whiteSpace: 'pre-wrap',
                                                wordWrap: 'break-word'
                                            }}>
                                                {accumulatedTranscript}
                                            </p>
                                        )}
                                        {interimTranscript && (
                                            <p style={{ 
                                                margin: '0', 
                                                color: '#666', 
                                                fontSize: '0.95rem',
                                                lineHeight: '1.6',
                                                fontStyle: 'italic',
                                                opacity: 0.7,
                                                whiteSpace: 'pre-wrap',
                                                wordWrap: 'break-word'
                                            }}>
                                                {interimTranscript}
                                            </p>
                                        )}
                                        {!accumulatedTranscript && !interimTranscript && isListening && (
                                            <p style={{ 
                                                margin: 0, 
                                                color: '#999', 
                                                fontSize: '0.9rem',
                                                fontStyle: 'italic'
                                            }}>
                                                Start speaking to see your transcription here...
                                            </p>
                                        )}
                                    </div>
                                )}
                                
                                {isProcessing && !isEditingTranscript && (
                                    <div style={{ 
                                        padding: '15px', 
                                        background: '#FFF9C4', 
                                        borderRadius: '8px',
                                        marginBottom: '15px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <span style={{ fontSize: '1.2rem' }}>⏳</span>
                                        <p style={{ margin: 0, color: '#2C2416', fontWeight: '500' }}>
                                            Formatting recipe with AI using Gemini 2.0 Flash...
                                        </p>
                                    </div>
                                )}
                            </div>
                            <hr />
                        </div>
                    ) : null}

                    <Form>
                        <Form.Group controlId="title" className="form-group">
                            <Form.Label className="form-label">Title:</Form.Label>
                            <Form.Control
                                type="text"
                                value={recipe.title}
                                onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
                                className="form-control"
                            />
                        </Form.Group>
                        <Form.Group controlId="description" className="form-group">
                            <Form.Label className="form-label">Description:</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={recipe.description}
                                onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
                                className="form-control"
                            />
                        </Form.Group>
                    </Form>
                    <hr />
                    <div>
                        <h4>Ingredients</h4>
                        {(mode === 'type' || (mode === 'speak' && (editType === 'ingredient' && editIndex !== null))) && (
                            <div className='ind-container'>
                                <input
                                    type="text"
                                    placeholder="Ingredient name"
                                    value={ingredientInput}
                                    onChange={(e) => setIngredientInput(e.target.value)}
                                    onKeyPress={(e) => handleKeyPress(e, 'ingredient')}
                                    className="form-control"
                                    style={{ flex: '2' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Amount (optional)"
                                    value={ingredientAmount}
                                    onChange={(e) => setIngredientAmount(e.target.value)}
                                    onKeyPress={(e) => handleKeyPress(e, 'ingredient')}
                                    className="form-control"
                                    style={{ flex: '1' }}
                                />
                                <button onClick={handleAddIngredient} className="bind">Add/Edit</button>
                                {mode === 'speak' && editType === 'ingredient' && (
                                    <button 
                                        onClick={() => {
                                            setEditIndex(null);
                                            setEditType(null);
                                            setIngredientInput('');
                                            setIngredientAmount('');
                                        }} 
                                        className="bind"
                                        style={{ background: '#999' }}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        )}
                        {mode === 'speak' && recipe.ingredients.length > 0 && (
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px', fontStyle: 'italic' }}>
                                💡 You can click on ingredients to edit them
                            </p>
                        )}
                        <ol className="instruction-list">
                            {recipe.ingredients.map((ingredient, index) => (
                                <li 
                                    key={index} 
                                    onClick={() => handleEdit(index, 'ingredient')} 
                                    className="instruction-item"
                                    style={{ cursor: 'pointer' }}
                                >
                                    {formatIngredientDisplay(ingredient)}
                                </li>
                            ))}
                        </ol>        
                    </div>
                    <hr />
                    <div>
                        <h4>Instructions</h4>
                        {(mode === 'type' || (mode === 'speak' && (editType === 'instruction' && editIndex !== null))) && (
                            <div className='ind-container'>
                                <input
                                    type="text"
                                    placeholder="Instruction step"
                                    value={instructionInput}
                                    onChange={(e) => setInstructionInput(e.target.value)}
                                    onKeyPress={(e) => handleKeyPress(e, 'instruction')}
                                    className="form-control"
                                    style={{ flex: '2' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Time (optional)"
                                    value={instructionTime}
                                    onChange={(e) => setInstructionTime(e.target.value)}
                                    onKeyPress={(e) => handleKeyPress(e, 'instruction')}
                                    className="form-control"
                                    style={{ flex: '1' }}
                                />
                                <button onClick={handleAddInstruction} className="bind">Add/Edit</button>
                                {mode === 'speak' && editType === 'instruction' && (
                                    <button 
                                        onClick={() => {
                                            setEditIndex(null);
                                            setEditType(null);
                                            setInstructionInput('');
                                            setInstructionTime('');
                                        }} 
                                        className="bind"
                                        style={{ background: '#999' }}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        )}
                        {mode === 'speak' && recipe.instructions.length > 0 && (
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px', fontStyle: 'italic' }}>
                                💡 You can click on instructions to edit them
                            </p>
                        )}
                        <ol className="instruction-list">
                            {recipe.instructions.map((instruction, index) => (
                                <li 
                                    key={index} 
                                    onClick={() => handleEdit(index, 'instruction')}  
                                    className="instruction-item"
                                    style={{ cursor: 'pointer' }}
                                >
                                    {formatInstructionDisplay(instruction)}
                                </li>
                            ))}
                        </ol>
                    </div>
                </Modal.Body>
                <Modal.Footer className="modal-footer">
                    <button variant="primary" onClick={handleAddRecipe} className="add-button">
                        {editRecipe ? 'Update Recipe' : 'Save Recipe'}
                    </button>
                </Modal.Footer>
            </Modal>      
        </div>
    );
}
