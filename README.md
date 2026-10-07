# CineSense — Movie Review Sentiment Analyzer

> **Understand what audiences really feel.**

CineSense is a full-stack web application that allows users to enter movie reviews and automatically classifies them as 😊 Positive, 😐 Neutral, or 😞 Negative using real Natural Language Processing (NLP).

## Features
- **Instant Analysis**: Analyze reviews within seconds using the VADER sentiment algorithm.
- **Three-Way Classification**: Reviews are classified based on standard VADER compound score thresholds.
- **Detailed Insights**: View the compound score, confidence indicator, and sentiment-bearing words.
- **Review History**: Logged-in users can save their reviews and manage their history in the cloud.
- **Analytics Dashboard**: Visualize sentiment trends, distributions, and averages using interactive charts.
- **Responsive & Accessible**: Works across all devices with keyboard navigation and cinematic dark/light mode support.

## Target Audiences / Use Cases
- **Movie Viewers & Audience**: Enter movie reviews, get positive/neutral/negative sentiment scores, and review previous analyses.
- **Movie Critics**: Analyze large numbers of reviews rapidly to identify overall audience sentiment and compare reactions.
- **Movie Enthusiasts**: Track personal opinions about different movies and analyze how reviews vary over time using the dashboard.
- **Students & Researchers**: Use CineSense as a practical NLP learning tool to study sentiment analysis, VADER lexical rules, and explore data trends.
- **Production & Marketing Teams**: Analyze audience feedback to identify whether reviews are generally positive or negative, helping to understand post-release reactions.

## Technology Stack
**Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React, Recharts
**Backend**: Node.js, Express, Sequelize (ORM), `vader-sentiment` (NLP), JSON Web Tokens (JWT), bcrypt
**Database**: Supabase PostgreSQL

## Architecture & NLP Methodology

```mermaid
graph TD
    A[React Frontend] -->|REST API Request| B(Node.js Backend)
    B --> C{vader-sentiment NLP}
    C -->|Calculates compound score| D[Classification Logic]
    D --> E[(Supabase PostgreSQL)]
    E -->|Stores Review History| B
    B -->|Returns JSON Response| A
    A -->|Renders UI & Charts| F[User Dashboard]
```

1. **Frontend**: Sends the review text to the Express API.
2. **Backend (Node.js)**: Receives the text and passes it to the `vader-sentiment` NLP analyzer.
3. **NLP (VADER)**: Calculates the `pos`, `neu`, `neg`, and `compound` scores.
4. **Classification**:
   - `compound >= 0.05` → **Positive**
   - `compound <= -0.05` → **Negative**
   - Otherwise → **Neutral**
5. **Persistence**: If the user is logged in, the review and its scores are saved to the remote Supabase database.
6. **Response**: The API returns the calculated scores and classification back to the React frontend for visualization.

## Prerequisites
- Node.js (v18+)
- Supabase Account (for database)

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/kirankirankumarr15-cmd/Movie-Review-Sentiment-Analyze.git
cd "Movie Review Sentiment Analyze"
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Database Setup (Supabase)
Create a `.env` file in the `backend` directory and add your connection details:
```env
PORT=5000
SECRET_KEY=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5174
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```
*(Note: Sequelize will automatically create the `Users` and `Reviews` tables in your Supabase database the first time you start the backend).*

## Running the Application

You will need two separate terminal windows.

### Terminal 1: Start the Backend
```bash
cd backend
npm start
# or: node server.js
```
*Runs on http://localhost:5000*

### Terminal 2: Start the Frontend
```bash
cd frontend
npm run dev
```
*Runs on http://localhost:5174 (or 5173)*

## API Documentation

| Method | Endpoint | Auth Required? | Description |
|--------|----------|----------------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Authenticate user & get JWT |
| POST | `/api/auth/logout` | Yes | Logout |
| GET | `/api/auth/me` | Yes | Get current user profile |
| POST | `/api/analyze` | Optional | Analyze sentiment (saves to Supabase if logged in) |
| GET | `/api/reviews` | Yes | Get user's review history |
| DELETE | `/api/reviews/:id`| Yes | Delete a specific review |
| GET | `/api/stats` | Yes | Get analytics dashboard stats |

## Limitations & Future Improvements
- **Context/Sarcasm**: VADER is a lexicon and rule-based sentiment analysis tool. It struggles with deep context, irony, or heavy sarcasm.
- **Future Improvement**: Upgrade the NLP engine from VADER to a transformer-based model via Hugging Face for better contextual understanding.
- **Future Improvement**: Add pagination to the Review History endpoint.

## License
MIT License
