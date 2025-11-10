import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useStories } from '../../context/StoriesContext';
import './Stories.css';

export default function Stories() {
    const { stories, playlists, addStory, updateStory, deleteStory, addPlaylist, updatePlaylist, deletePlaylist, addStoryToPlaylist, removeStoryFromPlaylist } = useStories();
    const [showStoryModal, setShowStoryModal] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [showMoveStoryModal, setShowMoveStoryModal] = useState(false);
    const [selectedStory, setSelectedStory] = useState(null);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
    const [expandedPlaylistId, setExpandedPlaylistId] = useState(null);
    const [editingStory, setEditingStory] = useState(null);
    const [editingPlaylist, setEditingPlaylist] = useState(null);
    const [storyForm, setStoryForm] = useState({
        title: '',
        content: '',
        type: 'blog', // 'blog', 'video', 'image'
        mediaUrl: ''
    });
    const [playlistForm, setPlaylistForm] = useState({
        name: '',
        description: ''
    });

    const handleCreateStory = () => {
        setEditingStory(null);
        setStoryForm({ title: '', content: '', type: 'blog', mediaUrl: '' });
        setShowStoryModal(true);
    };

    const handleEditStory = (story) => {
        setEditingStory(story);
        setStoryForm({
            title: story.title || '',
            content: story.content || '',
            type: story.type || 'blog',
            mediaUrl: story.mediaUrl || ''
        });
        setShowStoryModal(true);
    };

    const handleSaveStory = () => {
        if (!storyForm.title.trim()) {
            alert('Please enter a title');
            return;
        }
        if (editingStory) {
            updateStory(editingStory.id, storyForm);
        } else {
            addStory(storyForm);
        }
        setShowStoryModal(false);
        setStoryForm({ title: '', content: '', type: 'blog', mediaUrl: '' });
        setEditingStory(null);
    };

    const handleDeleteStory = (id) => {
        if (window.confirm('Are you sure you want to delete this story?')) {
            deleteStory(id);
        }
    };

    const handleCreatePlaylist = () => {
        setEditingPlaylist(null);
        setPlaylistForm({ name: '', description: '' });
        setShowPlaylistModal(true);
    };

    const handleEditPlaylist = (playlist) => {
        setEditingPlaylist(playlist);
        setPlaylistForm({
            name: playlist.name || '',
            description: playlist.description || ''
        });
        setShowPlaylistModal(true);
    };

    const handleSavePlaylist = () => {
        if (!playlistForm.name.trim()) {
            alert('Please enter a playlist name');
            return;
        }
        if (editingPlaylist) {
            updatePlaylist(editingPlaylist.id, playlistForm);
        } else {
            addPlaylist(playlistForm);
        }
        setShowPlaylistModal(false);
        setPlaylistForm({ name: '', description: '' });
        setEditingPlaylist(null);
    };

    const handleDeletePlaylist = (id) => {
        if (window.confirm('Are you sure you want to delete this playlist?')) {
            deletePlaylist(id);
        }
    };

    const handleAddToPlaylist = (storyId, playlistId) => {
        addStoryToPlaylist(playlistId, storyId);
        alert('Story added to playlist!');
    };

    const handleMoveStory = (story) => {
        setSelectedStory(story);
        setShowMoveStoryModal(true);
    };

    const handleConfirmMoveStory = () => {
        if (selectedStory && selectedPlaylistId) {
            // Remove from all playlists first
            playlists.forEach(playlist => {
                if (playlist.stories?.includes(selectedStory.id)) {
                    removeStoryFromPlaylist(playlist.id, selectedStory.id);
                }
            });
            // Add to selected playlist
            addStoryToPlaylist(selectedPlaylistId, selectedStory.id);
            setShowMoveStoryModal(false);
            setSelectedStory(null);
            setSelectedPlaylistId(null);
            alert('Story moved to playlist!');
        }
    };

    const handleRemoveFromPlaylist = (playlistId, storyId) => {
        if (window.confirm('Remove this story from the playlist?')) {
            removeStoryFromPlaylist(playlistId, storyId);
        }
    };

    const togglePlaylist = (playlistId) => {
        setExpandedPlaylistId(expandedPlaylistId === playlistId ? null : playlistId);
    };

    const getStoriesInPlaylist = (playlistId) => {
        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist || !playlist.stories) return [];
        return stories.filter(story => playlist.stories.includes(story.id));
    };

    const getPlaylistsForStory = (storyId) => {
        return playlists.filter(playlist => playlist.stories?.includes(storyId));
    };

    const handlePasteUrl = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                // Auto-detect URL type
                const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
                const imageRegex = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
                
                if (youtubeRegex.test(text)) {
                    // Convert YouTube URL to embed URL
                    const videoId = text.match(youtubeRegex)[1];
                    setStoryForm({ ...storyForm, type: 'video', mediaUrl: `https://www.youtube.com/embed/${videoId}` });
                } else if (imageRegex.test(text) || text.startsWith('http')) {
                    if (imageRegex.test(text)) {
                        setStoryForm({ ...storyForm, type: 'image', mediaUrl: text });
                    } else {
                        setStoryForm({ ...storyForm, type: 'video', mediaUrl: text });
                    }
                } else {
                    setStoryForm({ ...storyForm, mediaUrl: text });
                }
                alert('URL pasted! Please select the correct type.');
            }
        } catch (err) {
            console.error('Failed to read clipboard:', err);
            alert('Could not read clipboard. Please paste manually.');
        }
    };

    return (
        <div className="stories-container">
            <div className="app-header">
                <h1>📖 Stories & Content</h1>
                <p>Create and organize your stories, blogs, and videos</p>
            </div>

            <div className="stories-actions">
                <button onClick={handleCreateStory} className="action-button create-button">
                    ➕ Create Story
                </button>
                <button onClick={handleCreatePlaylist} className="action-button playlist-button">
                    📋 Create Playlist
                </button>
            </div>

            {/* Playlists Section */}
            {playlists.length > 0 && (
                <div className="section">
                    <h2>📋 Playlists (Folders)</h2>
                    <div className="playlists-grid">
                        {playlists.map(playlist => {
                            const playlistStories = getStoriesInPlaylist(playlist.id);
                            const isExpanded = expandedPlaylistId === playlist.id;
                            return (
                                <div key={playlist.id} className="playlist-card">
                                    <div className="playlist-header" onClick={() => togglePlaylist(playlist.id)} style={{ cursor: 'pointer' }}>
                                        <div>
                                            <h3>{isExpanded ? '📂' : '📁'} {playlist.name}</h3>
                                            <p>{playlist.description}</p>
                                        </div>
                                        <div className="playlist-stories-count">
                                            {playlist.stories?.length || 0} {playlist.stories?.length === 1 ? 'story' : 'stories'}
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <div className="playlist-content">
                                            {playlistStories.length === 0 ? (
                                                <div className="empty-playlist">
                                                    <p>No stories in this playlist yet.</p>
                                                    <p style={{ fontSize: '0.9rem', color: '#999' }}>Add stories using the dropdown below each story card.</p>
                                                </div>
                                            ) : (
                                                <div className="playlist-stories-list">
                                                    {playlistStories.map(story => (
                                                        <div key={story.id} className="playlist-story-item">
                                                            <div className="playlist-story-info">
                                                                <span className="story-type-badge-small">{story.type}</span>
                                                                <span className="story-title-small">{story.title}</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleRemoveFromPlaylist(playlist.id, story.id)}
                                                                className="remove-from-playlist-btn"
                                                                title="Remove from playlist"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="playlist-actions">
                                        <button onClick={() => handleEditPlaylist(playlist)} className="edit-btn">✏️ Edit</button>
                                        <button onClick={() => handleDeletePlaylist(playlist.id)} className="delete-btn">🗑️ Delete</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Stories Section */}
            <div className="section">
                <h2>📖 Stories</h2>
                {stories.length === 0 ? (
                    <div className="empty-state">
                        <p>No stories yet. Create your first story!</p>
                    </div>
                ) : (
                    <div className="stories-grid">
                        {stories.map(story => (
                            <div key={story.id} className="story-card">
                                <div className="story-type-badge">{story.type}</div>
                                <h3>{story.title}</h3>
                                {story.type === 'video' && story.mediaUrl && (
                                    <div className="media-preview">
                                        <iframe
                                            src={story.mediaUrl}
                                            title={story.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            style={{ width: '100%', height: '200px', borderRadius: '8px' }}
                                        />
                                    </div>
                                )}
                                {story.type === 'image' && story.mediaUrl && (
                                    <div className="media-preview">
                                        <img src={story.mediaUrl} alt={story.title} style={{ width: '100%', borderRadius: '8px' }} />
                                    </div>
                                )}
                                {story.content && (
                                    <p className="story-content">{story.content.substring(0, 150)}...</p>
                                )}
                                {getPlaylistsForStory(story.id).length > 0 && (
                                    <div className="story-playlists">
                                        <strong>In playlists:</strong>
                                        {getPlaylistsForStory(story.id).map(playlist => (
                                            <span key={playlist.id} className="playlist-tag">
                                                📁 {playlist.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="story-actions">
                                    <button onClick={() => handleEditStory(story)} className="edit-btn">✏️ Edit</button>
                                    <button onClick={() => handleDeleteStory(story.id)} className="delete-btn">🗑️ Delete</button>
                                    {playlists.length > 0 && (
                                        <>
                                            <select
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        handleAddToPlaylist(story.id, parseInt(e.target.value));
                                                        e.target.value = '';
                                                    }
                                                }}
                                                className="add-to-playlist-select"
                                            >
                                                <option value="">Add to playlist...</option>
                                                {playlists.map(playlist => (
                                                    <option key={playlist.id} value={playlist.id}>{playlist.name}</option>
                                                ))}
                                            </select>
                                            <button 
                                                onClick={() => handleMoveStory(story)}
                                                className="move-btn"
                                                title="Move to playlist"
                                            >
                                                📁 Move
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Story Modal */}
            <Modal show={showStoryModal} onHide={() => { setShowStoryModal(false); setEditingStory(null); }} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingStory ? 'Edit Story' : 'Create Story'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                value={storyForm.title}
                                onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                                placeholder="Enter story title"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Type</Form.Label>
                            <Form.Select
                                value={storyForm.type}
                                onChange={(e) => setStoryForm({ ...storyForm, type: e.target.value })}
                            >
                                <option value="blog">Blog</option>
                                <option value="video">Video</option>
                                <option value="image">Image</option>
                            </Form.Select>
                        </Form.Group>
                        {(storyForm.type === 'video' || storyForm.type === 'image') && (
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Media URL
                                    <button 
                                        type="button"
                                        onClick={handlePasteUrl}
                                        className="paste-url-btn"
                                        style={{
                                            marginLeft: '10px',
                                            padding: '4px 12px',
                                            background: '#FFD60A',
                                            color: '#2C2416',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: '500'
                                        }}
                                    >
                                        📋 Paste URL
                                    </button>
                                </Form.Label>
                                <Form.Control
                                    type="url"
                                    value={storyForm.mediaUrl}
                                    onChange={(e) => setStoryForm({ ...storyForm, mediaUrl: e.target.value })}
                                    placeholder={storyForm.type === 'video' ? 'Paste YouTube URL or video URL here' : 'Paste image URL here'}
                                />
                                <Form.Text className="text-muted">
                                    {storyForm.type === 'video' 
                                        ? 'Paste any video URL (YouTube, Vimeo, etc.) or use the "Paste URL" button above'
                                        : 'Paste any image URL (jpg, png, gif, webp, etc.)'}
                                </Form.Text>
                            </Form.Group>
                        )}
                        <Form.Group className="mb-3">
                            <Form.Label>Content</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={6}
                                value={storyForm.content}
                                onChange={(e) => setStoryForm({ ...storyForm, content: e.target.value })}
                                placeholder="Enter story content..."
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={() => { setShowStoryModal(false); setEditingStory(null); }} className="cancel-btn">Cancel</button>
                    <button onClick={handleSaveStory} className="save-btn">Save</button>
                </Modal.Footer>
            </Modal>

            {/* Playlist Modal */}
            <Modal show={showPlaylistModal} onHide={() => { setShowPlaylistModal(false); setEditingPlaylist(null); }}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingPlaylist ? 'Edit Playlist' : 'Create Playlist'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Playlist Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={playlistForm.name}
                                onChange={(e) => setPlaylistForm({ ...playlistForm, name: e.target.value })}
                                placeholder="Enter playlist name"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={playlistForm.description}
                                onChange={(e) => setPlaylistForm({ ...playlistForm, description: e.target.value })}
                                placeholder="Enter playlist description"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={() => { setShowPlaylistModal(false); setEditingPlaylist(null); }} className="cancel-btn">Cancel</button>
                    <button onClick={handleSavePlaylist} className="save-btn">Save</button>
                </Modal.Footer>
            </Modal>

            {/* Move Story Modal */}
            <Modal show={showMoveStoryModal} onHide={() => { setShowMoveStoryModal(false); setSelectedStory(null); setSelectedPlaylistId(null); }}>
                <Modal.Header closeButton>
                    <Modal.Title>Move Story to Playlist</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedStory && (
                        <div>
                            <p><strong>Story:</strong> {selectedStory.title}</p>
                            <Form.Group className="mb-3">
                                <Form.Label>Select Playlist</Form.Label>
                                <Form.Select
                                    value={selectedPlaylistId || ''}
                                    onChange={(e) => setSelectedPlaylistId(parseInt(e.target.value))}
                                >
                                    <option value="">Choose a playlist...</option>
                                    {playlists.map(playlist => (
                                        <option key={playlist.id} value={playlist.id}>
                                            {playlist.name} ({playlist.stories?.length || 0} stories)
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Text className="text-muted">
                                    This will remove the story from its current playlist(s) and move it to the selected one.
                                </Form.Text>
                            </Form.Group>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={() => { setShowMoveStoryModal(false); setSelectedStory(null); setSelectedPlaylistId(null); }} className="cancel-btn">Cancel</button>
                    <button 
                        onClick={handleConfirmMoveStory} 
                        className="save-btn"
                        disabled={!selectedPlaylistId}
                    >
                        Move
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

