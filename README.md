# CineSense — Movie Review Sentiment Analyzer

> **Understand what audiences really feel.**

CineSense is a full-stack web application that allows users to enter movie reviews and automatically classifies them as 😊 Positive, 😐 Neutral, or 😞 Negative using real Natural Language Processing (NLP).

## Features
- **Instant Analysis**: Analyze reviews within seconds using NLTK VADER.
- **Three-Way Classification**: Reviews are classified based on standard VADER compound score thresholds.
- **Detailed Insights**: View the compound score, confidence indicator, and sentiment-bearing words.
- **Review History**: Logged-in users can save their reviews and manage their history.
- **Analytics Dashboard**: Visualize sentiment trends, distributions, and averages using interactive charts.
- **Responsive & Accessible**: Works across all devices with keyboard navigation and dark/light mode support.

## Target Audiences / Use Cases
- **Movie Viewers & Audience**: Enter movie reviews, get positive/neutral/negative sentiment scores, and review previous analyses.
- **Movie Critics**: Analyze large numbers of reviews rapidly to identify overall audience sentiment and compare reactions.
- **Movie Enthusiasts**: Track personal opinions about different movies and analyze how reviews vary over time using the dashboard.
- **Students & Researchers**: Use CineSense as a practical NLP learning tool to study sentiment analysis, VADER lexical rules, and explore data trends.
- **Production & Marketing Teams**: Analyze audience feedback to identify whether reviews are generally positive or negative, helping to understand post-release reactions.

## Technology Stack
**Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React, Recharts
**Backend**: Python, Flask, Flask-CORS, NLTK (VADER), SQLAlchemy, SQLite, Werkzeug (auth)

## Architecture & NLP Methodology
1. **Frontend**: Sends the review text to the Flask API.
2. **Backend (Flask)**: Receives the text and passes it to the NLTK VADER sentiment analyzer.
3. **NLP (VADER)**: Calculates the `pos`, `neu`, `neg`, and `compound` scores.
4. **Classification**:
   - `compound >= 0.05` → **Positive**
   - `compound <= -0.05` → **Negative**
   - Otherwise → **Neutral**
5. **Persistence**: If the user is logged in, the review and its scores are saved to the SQLite database.
6. **Response**: The API returns the calculated scores and classification back to the React frontend for visualization.

## Prerequisites
- Node.js (v18+)
- Python (v3.10+)

## Installation & Setup

### 1. Clone the repository
\`\`\`bash
git clone <your-repo-url>
cd CineSense
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
\`\`\`
*(Note: NLTK resources like the VADER lexicon will be downloaded automatically the first time the app starts).*

### 3. Frontend Setup
\`\`\`bash
cd frontend
npm install
\`\`\`

### 4. Environment Configuration
Create a `.env` file in the `backend` directory (you can copy `.env.example` if available) and add:
\`\`\`env
FLASK_ENV=development
SECRET_KEY=your_super_secret_key_here
DATABASE_URL=sqlite:///cinesense.db
FRONTEND_URL=http://localhost:5173
\`\`\`

## Running the Application

### Start the Backend
\`\`\`bash
cd backend
# Make sure your venv is active
python app.py
\`\`\`
*Runs on http://localhost:5000*

### Start the Frontend
\`\`\`bash
cd frontend
npm run dev
\`\`\`
*Runs on http://localhost:5173*

## API Documentation

| Method | Endpoint | Auth Required? | Description |
|--------|----------|----------------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Authenticate user & get JWT |
| POST | `/api/auth/logout` | Yes | Logout |
| GET | `/api/auth/me` | Yes | Get current user profile |
| POST | `/api/analyze` | Optional | Analyze sentiment (saves if logged in) |
| GET | `/api/reviews` | Yes | Get user's review history |
| DELETE | `/api/reviews/:id`| Yes | Delete a specific review |
| GET | `/api/stats` | Yes | Get analytics dashboard stats |

## Testing

**Backend Tests (pytest):**
\`\`\`bash
cd backend
python -m pytest tests/ -v
\`\`\`
This runs unit tests for the VADER sentiment engine and integration tests for the API endpoints using an in-memory SQLite database.

## Limitations & Future Improvements
- **Context/Sarcasm**: VADER is a lexicon and rule-based sentiment analysis tool. It struggles with deep context, irony, or heavy sarcasm.
- **Future Improvement**: Upgrade the NLP engine from VADER to a transformer-based model like DistilBERT (via Hugging Face) for better contextual understanding.
- **Future Improvement**: Add pagination to the Review History endpoint.

## License
MIT License
