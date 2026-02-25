# 🤖 AI-Powered Support Assistant

A full-stack AI-powered chatbot application that provides intelligent customer support using documentation-based responses. Built with React, Node.js/Express, SQLite, and multiple LLM providers.

## ✨ Features

- **AI-Powered Chat**: Real-time chat interface with AI responses based on product documentation
- **Multi-Provider LLM Support**: Works with OpenAI, Google Gemini, Claude, or Mistral
- **Session Management**: Persistent chat sessions stored in SQLite
- **Context-Aware Responses**: Maintains conversation history for better context
- **Document-Based Answering**: Ensures AI only responds based on provided documentation
- **Rate Limiting**: Built-in API rate limiting to prevent abuse
- **Responsive UI**: Mobile-friendly React interface with beautiful styling
- **Session History**: View and manage previous chat sessions
- **Error Handling**: Comprehensive error handling throughout the application

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI framework
- **Vite** - Ultra-fast build tool
- **CSS3** - Styling with responsive design
- **localStorage** - Session persistence

### Backend

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **SQLite3** - Lightweight database
- **express-rate-limit** - Rate limiting middleware
- **dotenv** - Environment variable management

### LLM Integration

- **Google Gemini API**
- **OpenAI API**
- **Anthropic Claude API**
- **Mistral API**

## 📋 Prerequisites

- **Node.js** 16+ and npm/yarn
- **API Key** from at least one LLM provider
- **Git** (optional, for cloning)

## 🚀 Quick Start

### 1. Setup Backend

```bash
cd support-backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your configuration
# IMPORTANT: Add your LLM_API_KEY
nano .env

# Start development server
npm run dev
```

The backend will run on `http://localhost:5002`

### 2. Setup Frontend

```bash
cd ../support-client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 3. Access the Application

Open your browser and navigate to: `http://localhost:5173`

## 📖 API Documentation

### Base URL

```
http://localhost:5002/api
```

### Endpoints

#### 1. **Send Chat Message**

```
POST /api/chat
Content-Type: application/json

{
  "sessionId": "session_123456789_abc123",
  "message": "How do I reset my password?"
}

Response:
{
  "success": true,
  "reply": "You can reset your password from Settings > Security.",
  "tokensUsed": 142,
  "timestamp": "2026-02-25T10:30:00.000Z"
}
```

#### 2. **Get Chat Messages**

```
GET /api/chat/:sessionId

Response:
{
  "success": true,
  "sessionId": "session_123456789_abc123",
  "messages": [
    {
      "id": 1,
      "session_id": "session_123...",
      "role": "user",
      "content": "How do I reset my password?",
      "created_at": "2026-02-25T10:30:00.000Z"
    },
    {
      "id": 2,
      "session_id": "session_123...",
      "role": "assistant",
      "content": "You can reset your password from Settings > Security.",
      "created_at": "2026-02-25T10:30:05.000Z"
    }
  ],
  "total": 2
}
```

#### 3. **Create Session**

```
POST /api/sessions
Content-Type: application/json

{
  "sessionId": "optional_custom_session_id"
}

Response:
{
  "success": true,
  "sessionId": "session_123456789_abc123",
  "created_at": "2026-02-25T10:30:00.000Z"
}
```

#### 4. **Get All Sessions**

```
GET /api/sessions

Response:
{
  "success": true,
  "sessions": [
    {
      "id": "session_123...",
      "created_at": "2026-02-25T10:30:00.000Z",
      "updated_at": "2026-02-25T10:35:00.000Z",
      "messageCount": 5
    }
  ],
  "total": 1
}
```

#### 5. **Get Specific Session**

```
GET /api/sessions/:sessionId

Response:
{
  "success": true,
  "session": {
    "id": "session_123...",
    "created_at": "2026-02-25T10:30:00.000Z",
    "updated_at": "2026-02-25T10:35:00.000Z",
    "messageCount": 5
  }
}
```

#### 6. **Clear Session Messages**

```
POST /api/sessions/:sessionId/clear

Response:
{
  "success": true,
  "message": "Session messages cleared successfully",
  "sessionId": "session_123..."
}
```

#### 7. **Delete Session**

```
DELETE /api/sessions/:sessionId

Response:
{
  "success": true,
  "message": "Session deleted successfully",
  "deletedSessionId": "session_123..."
}
```

#### 8. **Health Check**

```
GET /health

Response:
{
  "status": "OK",
  "timestamp": "2026-02-25T10:30:00.000Z",
  "environment": "development"
}
```

## 🗄️ Database Schema

### SQLite Tables

#### `sessions`

```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**

- `id` (TEXT, PK): Unique session identifier
- `created_at` (DATETIME): Session creation timestamp
- `updated_at` (DATETIME): Last activity timestamp

#### `messages`

```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
```

**Columns:**

- `id` (INTEGER, PK): Auto-incremented message ID
- `session_id` (TEXT, FK): Reference to session
- `role` (TEXT): "user" or "assistant"
- `content` (TEXT): Message content
- `created_at` (DATETIME): Message timestamp

**Indexes:**

- `idx_messages_session_id`: Optimizes queries by session
- `idx_messages_created_at`: Optimizes ordering by timestamp
- `idx_sessions_updated_at`: Optimizes session list ordering

## 📝 Documentation Format

Documentation is stored in `support-backend/src/docs/docs.json`:

```json
[
  {
    "id": "doc_1",
    "title": "Reset Password",
    "content": "Users can reset password from Settings > Security..."
  },
  {
    "id": "doc_2",
    "title": "Refund Policy",
    "content": "Refunds are allowed within 30 days of purchase..."
  }
]
```

### Adding Documentation

1. Edit `support-backend/src/docs/docs.json`
2. Add new entries with `id`, `title`, and `content`
3. The backend automatically loads and caches documentation
4. Restart the server to apply changes (or implement hot reload)

## 🔧 Configuration

### Backend (.env)

```env
# Server
PORT=5002
NODE_ENV=development

# LLM Provider
LLM_PROVIDER=gemini  # Options: gemini, openai, claude, mistral
LLM_API_KEY=your_api_key_here
LLM_MODEL=gemini-pro
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=1000

# Database
DB_PATH=./database.sqlite

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5002/api
```

## 🤝 How It Works

### Flow Diagram

```
User Message
    ↓
Frontend sends to Backend (/api/chat)
    ↓
Backend validates input & retrieves session
    ↓
Loads last 5 message pairs from DB for context
    ↓
Finds relevant documentation using similarity matching
    ↓
Builds comprehensive prompt with:
  - System instructions (doc-only rule)
  - Relevant documentation
  - Conversation history
  - Current user question
    ↓
Calls LLM API with prompt
    ↓
Stores user message and AI response in DB
    ↓
Returns response to frontend
    ↓
Frontend displays message with timestamp
```

### Key Features Explained

#### 1. **Document-Only Answering**

- The system constructs a prompt that explicitly instructs the AI to only use provided documentation
- If no relevant documentation is found, the AI responds: "Sorry, I don't have information about that."
- This prevents hallucination and ensures accurate, factual responses

#### 2. **Context Management**

- Maintains last 5 message pairs (10 messages max) for context
- Provides conversation history to the LLM for better understanding
- All context comes from SQLite, not in-memory storage

#### 3. **Similarity Matching**

- Uses Levenshtein distance to find relevant documentation
- Searches both title and content
- Weights title matches higher than content matches
- Returns top 5 most relevant documents

#### 4. **Session Persistence**

- Frontend generates unique session IDs (timestamp + random string)
- Stores in localStorage for continuity
- Backend creates sessions on first message
- All messages are stored in SQLite for history

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**
   - Never commit `.env` file
   - Use `.env.example` as template
   - Set all variables in production environment

2. **Database**
   - Back up `database.sqlite` regularly
   - Consider migration to PostgreSQL for larger deployments
   - Implement database connection pooling

3. **Rate Limiting**
   - Adjust rate limits based on usage patterns
   - Consider per-user rate limiting instead of per-IP
   - Implement CORS configuration

4. **LLM API**
   - Monitor token usage and costs
   - Implement caching for common queries
   - Add fallback to another LLM provider

5. **Frontend**
   - Build for production: `npm run build`
   - Serve static files from CDN
   - Enable gzip compression

### Example Docker Setup (Optional)

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY support-backend .
RUN npm ci --only=production
ENV NODE_ENV=production
CMD ["node", "server.js"]

# Frontend Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY support-client .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

## 🐛 Troubleshooting

### Frontend won't connect to backend

```
Error: Failed to send message
Solution: Ensure backend is running and VITE_API_URL is correct in .env
```

### LLM API returns error

```
Error: Gemini API error
Solution: Check LLM_API_KEY and ensure it has necessary permissions
```

### Database locked

```
Error: Database is locked
Solution: Close other connections, ensure only one process writes at a time
```

### Session not persisting

```
Issue: Messages lost after page reload
Solution: Check browser localStorage is enabled, verify DB backend
```

## 📊 Performance Optimization

1. **Frontend**
   - Message list virtualization for large conversations
   - Debounce input to reduce API calls
   - Progressive loading of message history

2. **Backend**
   - Database query optimization with indexes
   - Implement caching for documentation
   - Rate limiting to prevent overload

3. **LLM**
   - Context window management (less context = faster)
   - Token optimization in prompts
   - Batch requests if applicable

## 🔐 Security Features

- Input validation on all endpoints
- Rate limiting per IP address
- SQL injection prevention through parameterized queries
- Error messages don't expose sensitive information
- CORS configuration for frontend origin
- Environment variables for sensitive data

## 📈 Future Enhancements

- [ ] User authentication and authorization
- [ ] Multi-language support
- [ ] Embedding-based similarity search (instead of Levenshtein)
- [ ] Conversation analytics and insights
- [ ] Admin dashboard for documentation management
- [ ] WebSocket for real-time chat
- [ ] File upload support (PDFs, images)
- [ ] Conversation export (PDF, JSON)
- [ ] Dark mode theme
- [ ] Feedback system for AI responses

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 👨‍💻 Support

For issues, bugs, or feature requests, please:

1. Check existing documentation
2. Review troubleshooting section
3. Check API response status codes
4. Review browser console for errors
5. Verify environment configuration

## 🎯 Assumptions

1. **Single Tenant**: Application assumes single-user or admin-managed sessions
2. **Document Format**: Documentation is manually maintained in JSON format
3. **LLM Provider**: At least one LLM API key is available
4. **Timeouts**: Default 30-second timeout for LLM API calls
5. **Context Size**: Maintains last 5 message pairs (adjustable)
6. **Similarity Threshold**: 0.2 minimum similarity for document matching
7. **Session ID Format**: `session_${timestamp}_${randomString}`
8. **localStorage**: Frontend relies on browser localStorage for session persistence
9. **CORS**: Frontend and backend on same machine or CORS enabled
10. **No User System**: Currently no authentication/authorization system

## 📞 Contact

GitHub Copilot AI Assistant
Built as part of Innoira Assignment

---

**Last Updated**: February 25, 2026
**Version**: 1.0.0
