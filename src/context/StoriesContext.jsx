import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const StoriesContext = createContext();

export const useStories = () => {
  const context = useContext(StoriesContext);
  if (!context) {
    throw new Error('useStories must be used within a StoriesProvider');
  }
  return context;
};

export const StoriesProvider = ({ children }) => {
  const { user } = useAuth();
  const [stories, setStories] = useState(() => {
    if (!user) return [];
    const savedStories = localStorage.getItem(`recipehub_stories_${user.id}`);
    return savedStories ? JSON.parse(savedStories) : [];
  });

  const [playlists, setPlaylists] = useState(() => {
    if (!user) return [];
    const savedPlaylists = localStorage.getItem(`recipehub_playlists_${user.id}`);
    return savedPlaylists ? JSON.parse(savedPlaylists) : [];
  });

  useEffect(() => {
    if (user) {
      const savedStories = localStorage.getItem(`recipehub_stories_${user.id}`);
      const savedPlaylists = localStorage.getItem(`recipehub_playlists_${user.id}`);
      setStories(savedStories ? JSON.parse(savedStories) : []);
      setPlaylists(savedPlaylists ? JSON.parse(savedPlaylists) : []);
    } else {
      setStories([]);
      setPlaylists([]);
    }
  }, [user]);

  useEffect(() => {
    if (user && stories) {
      localStorage.setItem(`recipehub_stories_${user.id}`, JSON.stringify(stories));
    }
  }, [stories, user]);

  useEffect(() => {
    if (user && playlists) {
      localStorage.setItem(`recipehub_playlists_${user.id}`, JSON.stringify(playlists));
    }
  }, [playlists, user]);

  const addStory = (newStory) => {
    setStories(prevStories => [...prevStories, { ...newStory, id: Date.now(), createdAt: new Date().toISOString() }]);
  };

  const updateStory = (id, updatedStory) => {
    setStories(prevStories =>
      prevStories.map(story => story.id === id ? { ...updatedStory, id } : story)
    );
  };

  const deleteStory = (id) => {
    setStories(prevStories => prevStories.filter(story => story.id !== id));
  };

  const addPlaylist = (newPlaylist) => {
    setPlaylists(prevPlaylists => [...prevPlaylists, { ...newPlaylist, id: Date.now(), createdAt: new Date().toISOString(), stories: [] }]);
  };

  const updatePlaylist = (id, updatedPlaylist) => {
    setPlaylists(prevPlaylists =>
      prevPlaylists.map(playlist => playlist.id === id ? { ...updatedPlaylist, id } : playlist)
    );
  };

  const deletePlaylist = (id) => {
    setPlaylists(prevPlaylists => prevPlaylists.filter(playlist => playlist.id !== id));
  };

  const addStoryToPlaylist = (playlistId, storyId) => {
    setPlaylists(prevPlaylists =>
      prevPlaylists.map(playlist => {
        if (playlist.id === playlistId) {
          if (!playlist.stories.includes(storyId)) {
            return { ...playlist, stories: [...playlist.stories, storyId] };
          }
        }
        return playlist;
      })
    );
  };

  const removeStoryFromPlaylist = (playlistId, storyId) => {
    setPlaylists(prevPlaylists =>
      prevPlaylists.map(playlist => {
        if (playlist.id === playlistId) {
          return { ...playlist, stories: playlist.stories.filter(id => id !== storyId) };
        }
        return playlist;
      })
    );
  };

  return (
    <StoriesContext.Provider value={{
      stories,
      playlists,
      addStory,
      updateStory,
      deleteStory,
      addPlaylist,
      updatePlaylist,
      deletePlaylist,
      addStoryToPlaylist,
      removeStoryFromPlaylist
    }}>
      {children}
    </StoriesContext.Provider>
  );
};

