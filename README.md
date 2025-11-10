# soorudhan_mukiyam
# 🍳 RecipeHub

A modern, feature-rich recipe management application with voice input, AI-powered formatting, Google authentication, and content organization. Create, manage, and cook with your favorite recipes all in one place.

## ✨ Features

### 🔐 Authentication & Security
- **Google OAuth Login**: Secure sign-in with your Google account
- **User-Specific Data**: All recipes and content are stored per user account
- **Protected Routes**: Recipe finder and stories require authentication

### 📝 Recipe Management
- **Type Recipes**: Manually enter recipes with detailed information
  - Add ingredients with optional weights/amounts
  - Add instructions with optional timings
  - Organize your recipe collection
- **Speak Recipes**: Voice-powered recipe creation
  - Real-time speech-to-text with waveform visualization
  - AI-powered formatting using Google Gemini
  - Edit transcripts before processing
  - Original audio recordings saved with recipes
- **Edit & Delete**: Full CRUD operations for recipes
- **Recipe Finder**: Search for recipes using Spoonacular API (requires login)

### 🍳 Cooking Mode
- **Step-by-Step Guide**: Interactive cooking assistant
- **Ingredient Overview**: View all ingredients before starting
- **Instruction Cards**: Beautiful flashcard-style UI
- **Built-in Timers**: Automatic countdown for timed instructions
- **Alarm Notifications**: Audio alerts when timers complete
- **Progress Tracking**: Visual progress indicators

### 📖 Stories & Content Management
- **Create Stories**: Add blogs, videos, and images
- **URL Pasting**: One-click URL pasting with auto-detection
  - YouTube URLs automatically converted to embed format
  - Image URLs auto-detected
  - Support for various media types
- **Playlists (Folders)**: Organize stories like folders
  - Expandable/collapsible playlist view
  - Drag-and-drop style organization
  - Move stories between playlists
  - Remove stories from playlists
- **Visual Organization**: See which playlists contain which stories

### 🔊 Audio Features
- **Text-to-Speech**: Listen to recipe instructions
- **Original Recordings**: Playback your original voice recordings
- **Audio Controls**: Start, stop, and manage audio playback

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Google Gemini API Key** ([Get it here](https://makersuite.google.com/app/apikey))
- **Google OAuth Client ID** ([Get it here](https://console.cloud.google.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd recipehub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
   ```

4. **Configure Google OAuth**
   
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable **Google+ API** and **People API**
   - Configure OAuth consent screen:
     - User Type: External
     - App name: RecipeHub
     - Support email: Your email
     - Scopes: `email`, `profile`, `openid`
   - Create OAuth 2.0 Client ID:
     - Application type: **Web application**
     - Name: RecipeHub Web Client
     - Authorized JavaScript origins: `http://localhost:5173`
     - Copy the Client ID and add it to your `.env` file

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 📖 Usage Guide

### Authentication

1. Click **"Sign in with Google"** in the navigation bar
2. Authorize the application with your Google account
3. Your profile picture and name will appear in the navigation
4. Click **"Logout"** to sign out or switch accounts

### Creating Recipes

#### Typing a Recipe

1. Click the **"➕ Add"** button
2. Select **"Type Recipe"**
3. Enter recipe details:
   - Title
   - Ingredients (with optional amounts/weights)
   - Instructions (with optional timings)
4. Click **"Add Recipe"** to save

#### Speaking a Recipe

1. Click the **"➕ Add"** button
2. Select **"Speak Recipe"**
3. Click **"Start Recording"**
4. Speak your recipe naturally:
   - Include ingredients with amounts
   - Include instructions with timings
   - The waveform shows your voice activity
5. Click **"Stop & Process"** when done
6. Review and edit the transcript if needed
7. Click **"Process with AI"** to format
8. Review the formatted recipe and click **"Add Recipe"**

### Cooking Mode

1. Click on any recipe card
2. Click **"🍳 Start Cooking Mode"**
3. Review all ingredients
4. Click **"Proceed to Cooking"**
5. Follow instructions step-by-step:
   - If a timer is present, it will countdown automatically
   - An alarm will sound when the timer completes
   - Click **"Next Instruction"** to proceed
6. Click **"Finish Cooking"** when done

### Managing Stories

#### Creating a Story

1. Navigate to **"Stories"** tab (requires login)
2. Click **"➕ Create Story"**
3. Fill in the form:
   - Title
   - Type (Blog, Video, or Image)
   - For Video/Image: Click **"📋 Paste URL"** or paste manually
   - Content/Description
4. Click **"Save"**

#### Creating a Playlist

1. Click **"📋 Create Playlist"**
2. Enter playlist name and description
3. Click **"Save"**

#### Organizing Stories

- **Add to Playlist**: Use the dropdown on any story card
- **Move Story**: Click **"📁 Move"** to move a story to a different playlist
- **View Playlist Contents**: Click on any playlist card to expand and see stories
- **Remove from Playlist**: Click the **✕** button in expanded playlist view

### Finding Recipes

1. Navigate to **"Find Recipes"** tab (requires login)
2. Enter search criteria:
   - Cuisine type
   - Dietary restrictions
   - Ingredients
   - Maximum preparation time
3. Click **"Search"**
4. Browse results and explore recipes

## 🛠️ Technology Stack

- **Frontend Framework**: React
- **Routing**: React Router DOM
- **State Management**: React Context API
- **UI Components**: React Bootstrap
- **Speech Recognition**: Web Speech API
- **Text-to-Speech**: Web Speech API
- **AI Processing**: Google Gemini 2.0 Flash
- **Authentication**: Google OAuth 2.0
- **Recipe Search**: Spoonacular API
- **Storage**: Browser localStorage
- **Build Tool**: Vite

## 🌐 Browser Compatibility

- **Speech Recognition**: Chrome, Edge, Safari (latest versions)
- **Text-to-Speech**: All modern browsers
- **Google OAuth**: All modern browsers
- **Local Storage**: All modern browsers

## 📦 Project Structure

```
recipehub/
├── src/
│   ├── components/
│   │   ├── CookingMode/      # Cooking mode component
│   │   ├── Home/             # Home page component
│   │   ├── RecipeFinder/     # Recipe search component
│   │   └── Stories/          # Stories and playlists component
│   ├── context/
│   │   ├── AuthContext.jsx   # Authentication context
│   │   ├── RecipeContext.jsx # Recipe management context
│   │   └── StoriesContext.jsx # Stories management context
│   ├── services/
│   │   ├── audioService.js   # Audio recording and playback
│   │   ├── geminiService.js  # Gemini AI integration
│   │   ├── speechService.js  # Speech recognition and TTS
│   │   └── spoonacularApi.js # Recipe search API
│   ├── App.jsx               # Main app component
│   └── main.jsx             # Entry point
├── .env                      # Environment variables (not in git)
└── README.md                # This file
```

## 💾 Data Storage

- All data is stored locally in your browser using `localStorage`
- Data is user-specific (separated by Google account ID)
- Storage keys:
  - `recipehub_user`: Current user information
  - `recipehub_recipes_{userId}`: User's recipes
  - `recipehub_stories_{userId}`: User's stories
  - `recipehub_playlists_{userId}`: User's playlists

## 🔒 Privacy & Security

- All data is stored locally in your browser
- No data is sent to external servers except:
  - Google OAuth for authentication
  - Google Gemini API for recipe formatting
  - Spoonacular API for recipe search
- Original audio recordings are stored as base64 strings locally
- User data is isolated per Google account

## 🐛 Troubleshooting

### Google Login Not Working

- Verify `VITE_GOOGLE_CLIENT_ID` is set correctly in `.env`
- Ensure `http://localhost:5173` is in Authorized JavaScript origins
- Restart the dev server after changing `.env`
- Check browser console for specific error messages

### Speech Recognition Not Working

- Use Chrome, Edge, or Safari browser
- Grant microphone permissions when prompted
- Check browser settings for microphone access

### Gemini API Errors

- Verify `VITE_GEMINI_API_KEY` is set correctly
- Check API quota limits
- Ensure the API key has access to Gemini models

## 📝 License

This project is open source and available for personal use.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or suggestions, please open an issue on the repository.

---

**Made with ❤️ for cooking enthusiasts**
