import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import './CookingMode.css';

export default function CookingMode({ recipe, show, onClose }) {
    const [currentStep, setCurrentStep] = useState('ingredients'); // 'ingredients' or 'instructions'
    const [instructionIndex, setInstructionIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const timerRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        if (show) {
            setCurrentStep('ingredients');
            setInstructionIndex(0);
            setTimeRemaining(null);
            setIsTimerRunning(false);
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [show]);

    const parseTime = (timeString) => {
        if (!timeString) return null;
        
        // Parse time strings like "5 minutes", "10 mins", "30 seconds", etc.
        const timeStr = timeString.toLowerCase().trim();
        const minutesMatch = timeStr.match(/(\d+)\s*(?:min|minute|minutes|mins)/);
        const secondsMatch = timeStr.match(/(\d+)\s*(?:sec|second|seconds)/);
        
        if (minutesMatch) {
            return parseInt(minutesMatch[1]) * 60;
        } else if (secondsMatch) {
            return parseInt(secondsMatch[1]);
        }
        
        // Try to extract just numbers
        const numberMatch = timeStr.match(/(\d+)/);
        if (numberMatch) {
            return parseInt(numberMatch[1]) * 60; // Assume minutes if no unit
        }
        
        return null;
    };

    const playAlarmSound = () => {
        // Create a simple alarm sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
    };

    const startTimer = (seconds) => {
        setTimeRemaining(seconds);
        setIsTimerRunning(true);
        
        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    setIsTimerRunning(false);
                    clearInterval(timerRef.current);
                    playAlarmSound();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleProceedToInstructions = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentStep('instructions');
            setIsAnimating(false);
            // Start timer for first instruction if it has one
            const firstInstruction = recipe.instructions[0];
            if (firstInstruction && typeof firstInstruction === 'object' && firstInstruction.time) {
                const seconds = parseTime(firstInstruction.time);
                if (seconds) {
                    startTimer(seconds);
                }
            }
        }, 300);
    };

    const handleNextInstruction = () => {
        if (instructionIndex < recipe.instructions.length - 1) {
            setIsAnimating(true);
            setTimeout(() => {
                const nextIndex = instructionIndex + 1;
                setInstructionIndex(nextIndex);
                setIsAnimating(false);
                
                // Start timer for next instruction if it has one
                const nextInstruction = recipe.instructions[nextIndex];
                if (nextInstruction && typeof nextInstruction === 'object' && nextInstruction.time) {
                    const seconds = parseTime(nextInstruction.time);
                    if (seconds) {
                        startTimer(seconds);
                    }
                }
            }, 300);
        } else {
            // Finished all instructions
            onClose();
        }
    };

    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const currentInstruction = recipe.instructions[instructionIndex];
    const instructionText = typeof currentInstruction === 'string' 
        ? currentInstruction 
        : (currentInstruction?.step || currentInstruction);
    const instructionTime = typeof currentInstruction === 'object' ? currentInstruction?.time : null;

    return (
        <Modal 
            show={show} 
            onHide={onClose} 
            size="lg" 
            centered
            className="cooking-mode-modal"
            backdrop="static"
        >
            <Modal.Header className="cooking-mode-header">
                <Modal.Title className="cooking-mode-title">
                    🍳 Cooking Mode: {recipe.title}
                </Modal.Title>
                <button 
                    onClick={onClose}
                    className="close-button"
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#2C2416'
                    }}
                >
                    ×
                </button>
            </Modal.Header>
            <Modal.Body className="cooking-mode-body">
                {currentStep === 'ingredients' && (
                    <div className={`flashcard ${isAnimating ? 'slide-out' : 'slide-in'}`}>
                        <div className="flashcard-content ingredients-card">
                            <h2 className="flashcard-title">📋 Ingredients</h2>
                            <div className="ingredients-list">
                                {recipe.ingredients.map((ingredient, index) => {
                                    const ingName = typeof ingredient === 'string' 
                                        ? ingredient 
                                        : ingredient.name;
                                    const ingAmount = typeof ingredient === 'object' 
                                        ? ingredient.amount 
                                        : null;
                                    return (
                                        <div key={index} className="ingredient-item">
                                            <span className="ingredient-name">{ingName}</span>
                                            {ingAmount && (
                                                <span className="ingredient-amount">({ingAmount})</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <button 
                                onClick={handleProceedToInstructions}
                                className="proceed-button"
                            >
                                ✓ Got it! Start Cooking →
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 'instructions' && (
                    <div className={`flashcard ${isAnimating ? 'slide-out' : 'slide-in'}`}>
                        <div className="flashcard-content instruction-card">
                            <div className="instruction-header">
                                <span className="instruction-number">
                                    Step {instructionIndex + 1} of {recipe.instructions.length}
                                </span>
                            </div>
                            
                            <div className="instruction-text">
                                {instructionText}
                            </div>

                            {instructionTime && isTimerRunning && timeRemaining !== null && (
                                <div className="timer-container">
                                    <div className="timer-display">
                                        ⏱️ {formatTime(timeRemaining)}
                                    </div>
                                    <div className="timer-label">Time Remaining</div>
                                </div>
                            )}

                            {instructionTime && !isTimerRunning && timeRemaining === 0 && (
                                <div className="timer-complete">
                                    🔔 Timer Complete! Ready for next step.
                                </div>
                            )}

                            <div className="instruction-actions">
                                {instructionIndex < recipe.instructions.length - 1 ? (
                                    <button 
                                        onClick={handleNextInstruction}
                                        disabled={isTimerRunning}
                                        className="next-button"
                                    >
                                        {isTimerRunning ? '⏱️ Wait for timer...' : 'Next Step →'}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleNextInstruction}
                                        disabled={isTimerRunning}
                                        className="finish-button"
                                    >
                                        {isTimerRunning ? '⏱️ Wait for timer...' : '✓ Finish Cooking'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
}

