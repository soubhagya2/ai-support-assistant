# 📚 Setup Guide - AI-Powered Support Assistant

This guide will walk you through setting up and running the AI-Powered Support Assistant locally.

## Prerequisites

Before you begin, make sure you have:

- **Node.js 16+** - Download from https://nodejs.org/
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for cloning)
- **API Key** from one LLM provider

## LLM Provider Setup

Choose ONE of the following providers and get an API key:

### Option 1: Google Gemini (Recommended for beginners)

1. Go to https://ai.google.dev/
2. Click "Get API key" button
3. Select "Create API key in new Google Cloud project" or use existing project
4. Copy the API key
5. Set `LLM_PROVIDER=gemini` in backend `.env`
6. Paste the key as `LLM_API_KEY`

### Option 2: OpenAI

1. Go to https://platform.openai.com/api-keys
2. Create a new API key (requires paid account with credits)
3. Set `LLM_PROVIDER=openai` in backend `.env`
4. Set `LLM_MODEL=gpt-3.5-turbo` or `gpt-4`

### Option 3: Claude (Anthropic)

1. Go to https://console.anthropic.com/
2. Create API key
3. Set `LLM_PROVIDER=claude` in backend `.env`
4. Set `LLM_MODEL=claude-3-sonnet-20240229`

### Option 4: Mistral

1. Go to https://console.mistral.ai/
2. Create API key
3. Set `LLM_PROVIDER=mistral` in backend `.env`
4. Set `LLM_MODEL=mistral-small`

## Installation Steps

### Step 1: Clone or Download Project

```bash
# If using git
git clone <repository-url>
cd ai-support

# If downloaded as zip, extract and navigate to folder
cd ai-support
```

### Step 2: Setup Backend

```bash
# Navigate to backend folder
cd support-backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env
# (On Windows: copy .env.example .env)

# Edit .env file and add your LLM API key
# Use your favorite editor (VS Code, Notepad, etc.)
```

**Edit `.support-backend/.env`:**

```env
PORT=5002
NODE_ENV=development
LLM_PROVIDER=gemini              # Change to your provider
LLM_API_KEY=YOUR_API_KEY_HERE    # IMPORTANT: Add your API key
LLM_MODEL=gemini-pro
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=1000
DB_PATH=./database.sqlite
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Setup Frontend

```bash
# Navigate to frontend folder
cd ../support-client

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env
# (On Windows: copy .env.example .env)
```

**Edit `support-client/.env`:**

```env
VITE_API_URL=http://localhost:5002/api
```

## Running the Application

### Terminal 1: Start Backend Server

```bash
cd support-backend
npm run dev

# You should see:
# ✅ SQLite Database Connected at: /path/to/database.sqlite
# 🚀 Server running on http://localhost:5002
```

### Terminal 2: Start Frontend Server

```bash
cd support-client
npm run dev

# You should see:
# ✨ ready in 123ms
# ➜  Local:   http://localhost:5173/
```

### Access Application

Open your browser and go to: **http://localhost:5173**

You should see the AI Support Assistant chat interface! 🎉

## Testing the Application

### Test 1: Basic Chat

1. Type: "How do I reset my password?"
2. You should get a response based on the documentation
3. Try asking: "What's your refund policy?"
4. Try asking: "Tell me a joke" (this should return "Sorry, I don't have information about that")

### Test 2: Session Persistence

1. Open Developer Tools (F12)
2. Go to Storage → Local Storage → http://localhost:5173
3. Look for `ai_support_session_id` key
4. Close and reopen the page - session should persist
5. Messages should still be there

### Test 3: Multiple Sessions

1. Click "New Chat" button
2. Session ID in header should change
3. Messages should be cleared
4. Start a new conversation

## Troubleshooting

### "Backend connection refused"

```
Error: Failed to fetch (or similar)

Solution:
1. Verify backend is running (npm run dev in support-backend)
2. Check VITE_API_URL in support-client/.env
3. Try accessing http://localhost:5002/health in browser
4. Check if port 5002 is in use by another app
```

### "API Key invalid"

```
Error: Gemini API error: Invalid API key

Solution:
1. Verify API key is correct and not expired
2. Ensure API key is pasted correctly in .env (no extra spaces)
3. Check LLM_PROVIDER matches your API key provider
4. Verify API is enabled in provider's dashboard
```

### "Database locked"

```
Error: database is locked

Solution:
1. Stop server (Ctrl+C in terminal)
2. Delete database.sqlite file
3. Start server again - it will create new database
```

### "Module not found"

```
Error: Cannot find module 'X'

Solution:
1. In affected folder, run: npm install
2. Delete node_modules folder and package-lock.json
3. Run npm install again
4. Restart dev server
```

### "Port already in use"

```
Error: Error: listen EADDRINUSE: address already in use :::5002

Solution:
1. Change PORT in support-backend/.env to 5003 or 5004
2. Or kill other process using port 5002:
   - Windows: netstat -ano | findstr :5002
   - Mac/Linux: lsof -i :5002
```

### "npm: command not found"

```
Solution: Node/npm not installed
1. Download Node.js from https://nodejs.org/
2. Run the installer and restart terminal
3. Verify: npm --version
```

## Project Structure

```
ai-support/
├── support-backend/
│   ├── src/
│   │   ├── config/          # Database & LLM config
│   │   ├── controllers/     # Request handlers
│   │   ├── docs/            # Product documentation
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # DB schema
│   │   ├── routes/          # API routes
│   │   └── services/        # Business logic
│   ├── .env.example         # Environment template
│   ├── .env.local          # Local dev config
│   ├── app.js              # Express app
│   ├── server.js           # Server entry
│   └── package.json        # Dependencies
│
├── support-client/
│   ├── src/
│   │   ├── api/            # API service
│   │   ├── components/     # React components
│   │   ├── styles/         # Component styles
│   │   ├── utils/          # Helper functions
│   │   ├── App.jsx         # Main app
│   │   ├── App.css         # App styles
│   │   ├── index.css       # Global styles
│   │   └── main.jsx        # Entry point
│   ├── .env.example        # Environment template
│   ├── .env.local         # Local dev config
│   ├── package.json       # Dependencies
│   └── vite.config.js     # Vite config
│
├── README.md              # Full documentation
└── SETUP.md              # This file
```

## Development Workflows

### Adding New Documentation

1. Edit `support-backend/src/docs/docs.json`
2. Add entry with `id`, `title`, `content`
3. Restart backend or implement hot reload
4. Test in chat interface

Example:

```json
[
  {
    "id": "doc_new",
    "title": "New Feature",
    "content": "This is how to use the new feature..."
  }
]
```

### Modifying Chat Behavior

**File**: `support-backend/src/services/promptBuilder.js`

Adjust the system prompt to change how AI responds:

- Change tone/style
- Add new instructions
- Modify output format

### Customizing UI

**Files**:

- Main styles: `support-client/src/App.css`
- Component styles: `support-client/src/styles/`
- Component logic: `support-client/src/components/`

### Changing LLM Provider

1. Edit `support-backend/.env`
2. Change `LLM_PROVIDER` to target provider
3. Update `LLM_API_KEY` with new provider's key
4. Adjust `LLM_MODEL` if needed
5. Restart backend

## Performance Tips

### Frontend

- Clear browser cache if styles don't update
- Use browser DevTools Network tab to debug API calls
- Enable "Disable cache" during development

### Backend

- Watch file changes: `npm run dev` uses nodemon
- Check database query performance with timing
- Monitor token usage with `tokensUsed` in responses

## Building for Production

### Backend

```bash
cd support-backend
npm ci --only=production
NODE_ENV=production npm start
```

### Frontend

```bash
cd support-client
npm run build

# Deploying dist folder to any static server
# (Netlify, Vercel, GitHub Pages, traditional web server)
```

## Common Commands Reference

| Command         | Location      | Purpose                 |
| --------------- | ------------- | ----------------------- |
| `npm install`   | Either folder | Install dependencies    |
| `npm run dev`   | Either folder | Start dev server        |
| `npm run build` | Frontend only | Build for production    |
| `npm start`     | Backend only  | Start production server |
| `npm run lint`  | Frontend only | Check code quality      |

## Getting Help

1. **Check README.md** for API documentation
2. **Check this file** for setup troubleshooting
3. **Review .env files** to ensure correct configuration
4. **Check backend logs** for error messages
5. **Review browser console** (F12) for frontend errors

## Next Steps

After setup works:

1. **Explore documentation**: Read README.md for API details
2. **Customize documentation**: Add your own FAQs in docs.json
3. **Modify styling**: Update CSS to match your brand
4. **Test thoroughly**: Try various queries
5. **Deploy**: Follow production deployment steps

---

**Stuck? Need help?**

- Re-read this guide carefully
- Check all .env files are correct
- Verify both servers are running
- Check browser DevTools Console (F12)
- Review terminal output for error messages

Happy chatting! 🚀
