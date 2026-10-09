/**
 * CineSense Movie Intelligence Service
 * =====================================
 * Fully self-contained — NO external API keys required.
 *
 * Uses:
 *  - OMDB API (free, no signup, uses the public demo key "trilogy")
 *  - vader-sentiment (already installed, for NLP)
 *  - Rule-based aspect detection (keyword matching)
 */

const axios = require('axios');
const vader = require('vader-sentiment');

// ─── OMDB (free public demo key, no signup needed) ───────────────────────────
const OMDB_BASE = 'https://www.omdbapi.com/';
const OMDB_KEY  = 'trilogy'; // OMDB's official free demo key

// ─── Aspect keyword lists ─────────────────────────────────────────────────────
const ASPECT_KEYWORDS = {
  Story:          ['story', 'plot', 'narrative', 'script', 'screenplay', 'writing', 'plotline', 'storyline', 'twist', 'ending', 'beginning', 'premise'],
  Acting:         ['acting', 'performance', 'actor', 'actress', 'cast', 'portray', 'role', 'character performance', 'acted', 'performances'],
  Direction:      ['direction', 'director', 'directed', 'filmmaking', 'cinematic vision', 'helmed'],
  Visuals:        ['visual', 'cinematography', 'special effect', 'vfx', 'cgi', 'stunning', 'breathtaking', 'beautiful', 'gorgeous', 'spectacular', 'scene', 'shot'],
  Music:          ['music', 'soundtrack', 'score', 'song', 'sound', 'audio', 'theme', 'composer', 'hans zimmer', 'background score'],
  Characters:     ['character', 'protagonist', 'antagonist', 'hero', 'villain', 'persona', 'role'],
  Pacing:         ['pacing', 'pace', 'slow', 'fast', 'rushed', 'dragged', 'boring', 'long', 'short', 'runtime', 'length', 'too long', 'too slow'],
  Emotions:       ['emotional', 'touching', 'moving', 'heartwarming', 'tear', 'cry', 'feel', 'feeling', 'powerful', 'impact', 'deep', 'profound'],
  Entertainment:  ['fun', 'entertaining', 'enjoyable', 'thrilling', 'exciting', 'gripping', 'engaging', 'bored', 'boring', 'dull', 'dull'],
};

const EMOTION_KEYWORDS = {
  Joy:            ['loved', 'love', 'amazing', 'wonderful', 'fantastic', 'great', 'joy', 'happy', 'joyful', 'delightful'],
  Excitement:     ['exciting', 'thrilling', 'gripping', 'riveting', 'edge', 'intense', 'exhilarating', 'action-packed'],
  Sadness:        ['sad', 'cry', 'tear', 'grief', 'heartbreak', 'depressing', 'melancholy', 'sorrow'],
  Anger:          ['angry', 'frustrating', 'terrible', 'awful', 'horrible', 'ridiculous', 'worst'],
  Surprise:       ['surprised', 'unexpected', 'twist', 'shocking', 'unpredictable', 'mindblowing', 'mind-blowing'],
  Disappointment: ['disappointing', 'disappointed', 'letdown', 'expected more', 'underwhelming', 'overhyped'],
  Awe:            ['breathtaking', 'stunning', 'awe', 'spectacular', 'masterpiece', 'brilliant', 'genius'],
};

// ─── Helper: VADER score for a text snippet ───────────────────────────────────
function vaderScore(text) {
  return vader.SentimentIntensityAnalyzer.polarity_scores(text);
}

// ─── Aspect-based analysis ────────────────────────────────────────────────────
function detectAspects(text) {
  const lower = text.toLowerCase();
  const detected = {};

  for (const [aspect, keywords] of Object.entries(ASPECT_KEYWORDS)) {
    const found = keywords.some(kw => lower.includes(kw));
    if (found) {
      // Find the sentence containing the keyword and score it
      const sentences = text.split(/[.!?,]/);
      const relevantSentences = sentences.filter(s =>
        keywords.some(kw => s.toLowerCase().includes(kw))
      );
      const sampleText = relevantSentences.join(' ') || text;
      const score = vaderScore(sampleText);
      const compound = score.compound;

      let sentiment = 'Neutral';
      if (compound >= 0.05) sentiment = 'Positive';
      else if (compound <= -0.05) sentiment = 'Negative';

      // Normalize score to 0–100
      const normalizedScore = Math.round(((compound + 1) / 2) * 100);
      detected[aspect] = { sentiment, score: Math.max(10, Math.min(99, normalizedScore)) };
    }
  }

  return detected;
}

// ─── Emotion detection ────────────────────────────────────────────────────────
function detectEmotions(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      found.push(emotion);
    }
  }
  return found.length > 0 ? found : ['Neutral'];
}

// ─── Generate public reception summary from OMDB/genre data ──────────────────
function generateReceptionSummary(omdbData) {
  const genres = (omdbData.Genre || '').split(',').map(g => g.trim());
  const imdbScore = parseFloat(omdbData.imdbRating) || 0;
  const rtScore = (omdbData.Ratings || []).find(r => r.Source === 'Rotten Tomatoes');
  const rtValue = rtScore ? parseInt(rtScore.Value) : null;
  const metaScore = omdbData.Metascore !== 'N/A' ? parseInt(omdbData.Metascore) : null;

  let criticSentiment = 'Mixed';
  let audienceSentiment = 'Mixed';

  const criticScore = rtValue ?? metaScore;
  if (criticScore !== null) {
    if (criticScore >= 75) criticSentiment = 'Mostly Positive';
    else if (criticScore >= 60) criticSentiment = 'Mixed';
    else criticSentiment = 'Mostly Negative';
  }

  if (imdbScore >= 7.5) audienceSentiment = 'Highly Positive';
  else if (imdbScore >= 6.0) audienceSentiment = 'Mostly Positive';
  else if (imdbScore >= 5.0) audienceSentiment = 'Mixed';
  else audienceSentiment = 'Mostly Negative';

  // Genre-based common praise/criticism
  const praises = [];
  const criticisms = [];

  if (genres.includes('Drama'))         praises.push('Emotional storytelling', 'Strong performances');
  if (genres.includes('Action'))        praises.push('Exciting action sequences', 'High-energy pacing');
  if (genres.includes('Sci-Fi'))        praises.push('Inventive world-building', 'Visual effects');
  if (genres.includes('Comedy'))        praises.push('Humor and wit', 'Entertaining dialogue');
  if (genres.includes('Thriller'))      praises.push('Suspense and tension', 'Gripping plot');
  if (genres.includes('Horror'))        praises.push('Atmosphere and tension', 'Jump scares');
  if (genres.includes('Animation'))     praises.push('Stunning animation', 'Family appeal');
  if (genres.includes('Romance'))       praises.push('Chemistry between leads', 'Emotional resonance');
  if (genres.includes('Documentary'))   praises.push('Informative content', 'Real-world impact');

  if (imdbScore < 7.5) criticisms.push('Mixed critical reception');
  if (imdbScore < 6.0) criticisms.push('Weak audience reception', 'Pacing issues');

  // Based on runtime
  const runtime = parseInt(omdbData.Runtime) || 0;
  if (runtime > 150)  criticisms.push('Long runtime');
  if (runtime < 90)   criticisms.push('Felt too short');

  return {
    criticSentiment,
    audienceSentiment,
    commonPraises: praises.length > 0 ? praises.slice(0, 4) : ['General entertainment value'],
    commonCriticisms: criticisms.length > 0 ? criticisms.slice(0, 3) : ['Some viewers found it divisive'],
  };
}

// ─── Comparison: user vs public ──────────────────────────────────────────────
function compareOpinions(userSentiment, publicSentiment, aspects) {
  const userPos = userSentiment === 'Positive';
  const pubPos = publicSentiment.includes('Positive') || publicSentiment.includes('positive');

  let alignment = 'Mixed';
  let explanation = '';

  if (userPos && pubPos) {
    alignment = 'High';
    explanation = 'Your positive review strongly aligns with the general audience reception. You share the same appreciation for this film as most viewers.';
  } else if (!userPos && !pubPos) {
    alignment = 'High';
    explanation = 'Your critical view matches the general public opinion — this film has received a mixed to negative reception overall.';
  } else if (userPos && !pubPos) {
    alignment = 'Low';
    explanation = 'Your positive take differs from the broader public reception, which was more mixed or critical. You may have connected with this film more personally.';
  } else {
    alignment = 'Low';
    explanation = 'Your critical view goes against the grain — most audiences responded positively, but you found elements that didn\'t work for you.';
  }

  return { alignment, explanation };
}

// ─── Generate AI Verdict ──────────────────────────────────────────────────────
function generateVerdict(movie, userAnalysis, publicReception, comparison) {
  const title = movie.Title || movie.title;
  const sentiment = userAnalysis.sentiment;
  const alignment = comparison.alignment;
  const praises = Object.entries(userAnalysis.aspects)
    .filter(([, v]) => v.sentiment === 'Positive')
    .map(([k]) => k);

  let verdict = `Your review of ${title} is ${sentiment.toLowerCase()}.`;

  if (praises.length > 0) {
    verdict += ` You particularly appreciated the ${praises.slice(0, 3).join(', ').toLowerCase()}.`;
  }

  if (alignment === 'High') {
    verdict += ` This closely aligns with the broader ${publicReception.audienceSentiment.toLowerCase()} public reception.`;
  } else {
    verdict += ` Interestingly, your opinion diverges from the general public response of "${publicReception.audienceSentiment}".`;
  }

  verdict += ` Based on publicly available information, this film is generally praised for ${publicReception.commonPraises.slice(0, 2).join(' and ').toLowerCase()}.`;

  return verdict;
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
async function performMovieIntelligence(movieName, reviewText) {
  // 1. Fetch movie info from OMDB (free, no signup)
  let omdbData = null;
  let sources = [];

  try {
    const searchRes = await axios.get(OMDB_BASE, {
      params: { apikey: OMDB_KEY, t: movieName, plot: 'short' },
      validateStatus: () => true,
      timeout: 8000
    });

    if (searchRes.data && searchRes.data.Response === 'True') {
      omdbData = searchRes.data;
      sources.push({ name: 'IMDb', url: `https://www.imdb.com/title/${omdbData.imdbID}/` });
      sources.push({ name: 'OMDB', url: `https://www.omdbapi.com/?t=${encodeURIComponent(movieName)}&apikey=trilogy` });
    }
  } catch (err) {
    console.warn('OMDB fetch failed:', err.message);
  }

  // Fallback if OMDB fails - use user-provided movie name
  if (!omdbData) {
    omdbData = {
      Title: movieName,
      Year: 'Unknown',
      Genre: '',
      Director: 'Unknown',
      Actors: '',
      Runtime: 'Unknown',
      Plot: 'No synopsis available.',
      Poster: null,
      imdbRating: 'N/A',
      Metascore: 'N/A',
      Ratings: [],
      Response: 'True'
    };
  }

  // 2. Build movie object
  const movie = {
    title: omdbData.Title,
    year: parseInt(omdbData.Year) || null,
    director: omdbData.Director || 'Unknown',
    genres: omdbData.Genre ? omdbData.Genre.split(',').map(g => g.trim()) : [],
    runtime: omdbData.Runtime || 'Unknown',
    cast: omdbData.Actors ? omdbData.Actors.split(',').map(a => a.trim()) : [],
    poster: omdbData.Poster !== 'N/A' ? omdbData.Poster : null,
    overview: omdbData.Plot || 'No synopsis available.',
  };

  // 3. Build ratings
  const rtRating = (omdbData.Ratings || []).find(r => r.Source === 'Rotten Tomatoes');
  const ratings = {
    imdb: omdbData.imdbRating !== 'N/A' ? `${omdbData.imdbRating}/10` : 'N/A',
    rottenTomatoes: rtRating ? rtRating.Value : 'N/A',
    metacritic: omdbData.Metascore !== 'N/A' ? `${omdbData.Metascore}/100` : 'N/A',
  };

  // 4. NLP — user review
  const vScores = vaderScore(reviewText);
  const compound = vScores.compound;

  let sentiment = 'Neutral';
  if (compound >= 0.05) sentiment = 'Positive';
  else if (compound <= -0.05) sentiment = 'Negative';

  const score = Math.round(((compound + 1) / 2) * 100);
  const confidence = Math.round(Math.abs(compound) * 100);
  const emotions = detectEmotions(reviewText);
  const aspects = detectAspects(reviewText);

  const userAnalysis = { sentiment, score, confidence, emotions, aspects };

  // 5. Public reception from OMDB data
  const publicReception = generateReceptionSummary(omdbData);

  // 6. Compare
  const comparison = compareOpinions(sentiment, publicReception.audienceSentiment, aspects);

  // 7. Verdict
  const verdict = generateVerdict(movie, userAnalysis, publicReception, comparison);

  return {
    movie,
    ratings,
    userAnalysis,
    publicReception,
    comparison,
    verdict,
    sources,
  };
}

module.exports = { performMovieIntelligence };
